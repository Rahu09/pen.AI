import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !isLoading && !isDisabled && message.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    addMessage();
    textareaRef.current?.focus();
  };

  return (
    <div className="shrink-0 border-t bg-background p-3">
      <div className="relative mx-auto w-full max-w-3xl">
        <Textarea
          rows={1}
          ref={textareaRef}
          maxRows={4}
          autoFocus
          disabled={isDisabled}
          onChange={handleInputChange}
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask a question about this PDF…"
          aria-label="Your question"
          className="scroll-thin resize-none py-3 pr-14 text-base"
        />

        <Button
          disabled={!canSend}
          size="icon"
          className="absolute bottom-1.5 right-1.5 h-9 w-9"
          aria-label="Send message"
          onClick={send}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
