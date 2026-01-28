'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Loader2, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'terminal' | 'dots';
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', variant = 'default', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };

    if (variant === 'terminal') {
      return (
        <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Terminal className={cn(sizeClasses[size], "text-terminal-green")} />
          </motion.div>
          <div className="flex items-center font-mono text-sm text-terminal-green">
            <span>Processing</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              |
            </motion.span>
          </div>
        </div>
      );
    }

    if (variant === 'dots') {
      return (
        <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-2 w-2 bg-terminal-green rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={className}
        {...props}
      >
        <Loader2 className={sizeClasses[size]} />
      </motion.div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Terminal-style loading with typing effect
interface TerminalLoadingProps {
  messages?: string[];
  className?: string;
}

const TerminalLoading = React.forwardRef<HTMLDivElement, TerminalLoadingProps>(
  ({ messages = ['Initializing...', 'Loading agents...', 'Almost ready...'], className, ...props }, ref) => {
    const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
    const [displayText, setDisplayText] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(true);

    React.useEffect(() => {
      const currentMessage = messages[currentMessageIndex];
      let currentIndex = 0;

      const typeText = () => {
        if (currentIndex <= currentMessage.length) {
          setDisplayText(currentMessage.slice(0, currentIndex));
          currentIndex++;
          setTimeout(typeText, 50);
        } else {
          setIsTyping(false);
          setTimeout(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
            setDisplayText('');
            setIsTyping(true);
          }, 1000);
        }
      };

      typeText();
    }, [currentMessageIndex, messages]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border bg-card font-mono text-sm",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-terminal-green/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-terminal-green/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        
        <div className="flex items-center text-foreground">
          <span className="text-terminal-green mr-2">$</span>
          <span>{displayText}</span>
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-terminal-green ml-1"
            >
              |
            </motion.span>
          )}
        </div>
      </div>
    );
  }
);

TerminalLoading.displayName = 'TerminalLoading';

// Full-screen loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'default' | 'terminal';
  className?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ isVisible, message = 'Loading...', variant = 'default', className, ...props }, ref) => {
    if (!isVisible) return null;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg border bg-card shadow-lg">
          {variant === 'terminal' ? (
            <TerminalLoading messages={[message]} />
          ) : (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground font-mono">{message}</p>
            </>
          )}
        </div>
      </motion.div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

export { 
  LoadingSpinner, 
  TerminalLoading, 
  LoadingOverlay,
  type LoadingSpinnerProps,
  type TerminalLoadingProps,
  type LoadingOverlayProps
};