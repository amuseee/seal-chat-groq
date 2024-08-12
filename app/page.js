'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    primary: {
      main: '#607D8B',
    },
    secondary: {
      main: '#B0BEC5',
    },
  },
});

const SealBox = styled(Box)({
  backgroundColor: '#A4D8E1',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const SealMessageBox = styled(Box)(({ role }) => ({
  backgroundColor: role === 'assistant' ? '#B0BEC5' : '#E0F7FA',
  color: role === 'assistant' ? '#000' : '#000',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  maxWidth: '75%',
}));

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Seally, your friendly seal chat helper! How can I assist you today? Ask me about anything relating to seals, their habitats, and what you can do to help them!",
    },
  ]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (message.trim() && !isLoading) {
      const newMessage = { role: 'user', content: message };
      setMessages([...messages, newMessage]);
      setMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, newMessage] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let updatedMessage = '';
        const messageId = Date.now();

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: updatedMessage, id: messageId },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          updatedMessage += decoder.decode(value, { stream: true });

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageId ? { ...msg, content: updatedMessage } : msg
            )
          );
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: updatedMessage } : msg
          )
        );

      } catch (error) {
        console.error('Error sending message:', error);
      }

      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <SealBox>
        <Stack
          direction="column"
          width="90%"
          maxWidth="500px"
          height="90%"
          maxHeight="700px"
          border="1px solid #B0BEC5"
          borderRadius={8}
          p={2}
          spacing={3}
          bgcolor="rgba(255, 255, 255, 0.8)"
          sx={{ backdropFilter: 'blur(10px)' }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#004D40' }}>
            Welcome to Seally's Chat!
          </Typography>
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <SealMessageBox role={msg.role}>
                  {msg.content}
                </SealMessageBox>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Type your message..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              sx={{
                bgcolor: '#ffffff',
                borderColor: '#B0BEC5',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#B0BEC5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#B0BEC5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#B0BEC5',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={isLoading}
              sx={{
                bgcolor: '#607D8B',
                color: 'white',
                '&:hover': {
                  bgcolor: '#455A64',
                },
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </SealBox>
    </ThemeProvider>
  );
}
