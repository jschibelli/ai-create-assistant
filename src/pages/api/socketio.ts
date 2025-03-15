// src/pages/api/socketio.ts
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { AnthropicService } from '@/services/ai/anthropic';
import { OpenAIService } from '@/services/ai/openai';
import { UsageTracker } from '@/services/usage/tracker';

const usageTracker = new UsageTracker();
const anthropicService = new AnthropicService();
const openaiService = new OpenAIService();

const SocketHandler = async (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    // Initialize Socket.io server
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXTAUTH_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    
    res.socket.server.io = io;
    
    // AI completions namespace
    const completionsNamespace = io.of('/ai-completions');
    
    completionsNamespace.on('connection', async (socket) => {
      // Authenticate socket connection
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user) {
        socket.disconnect(true);
        return;
      }
      
      const userId = session.user.id;
      
      socket.on('request_completion', async ({ prompt, position, modelId }) => {
        // Determine service based on model ID
        const service = modelId.startsWith('gpt') ? openaiService : anthropicService;
        
        // Estimate tokens
        const estimatedTokens = prompt.length / 4;
        
        // Check usage limits
        const canProceed = await usageTracker.trackTokenUsage(userId, modelId, estimatedTokens);
        
        if (!canProceed) {
          socket.emit('error', { 
            code: 'USAGE_LIMIT_EXCEEDED',
            message: 'Usage limit exceeded. Please upgrade your subscription.'
          });
          return;
        }
        
        try {
          // Stream tokens from the service
          await service.streamContent(
            prompt,
            (token) => {
              socket.emit('token', token);
            },
            {
              maxTokens: 500,
              temperature: 0.7,
            }
          );
          
          socket.emit('completion_end');
          
          // Final token count update (more accurate after completion)
          // In production, get actual token count from API response
        } catch (error) {
          socket.emit('error', { 
            code: 'AI_SERVICE_ERROR',
            message: 'Failed to generate content from AI service.'
          });
        }
      });
      
      socket.on('cancel_completion', () => {
        // Implement cancellation logic
        // (Note: API-level cancellation may not be supported by all providers)
      });
    });
  }
  
  res.end();
};

export default SocketHandler;