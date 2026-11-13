import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
      >
        <div
          className={cn(
            "relative flex aspect-square h-6 w-6 items-center justify-center rounded-full",
            {
              "order-2 bg-primary": message.isUserMessage,
              "order-1 bg-foreground": !message.isUserMessage,
              invisible: isNextMessageSamePerson,
            }
          )}
        >
          {message.isUserMessage ? (
            <Icons.user className="h-3/4 w-3/4 text-primary-foreground" />
          ) : (
            <Icons.logo className="h-3/4 w-3/4 fill-background" />
          )}
        </div>

        <div
          className={cn("mx-2 flex max-w-md flex-col space-y-2 text-base", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("inline-block rounded-2xl px-4 py-2", {
              "bg-primary text-primary-foreground": message.isUserMessage,
              "bg-muted text-foreground": !message.isUserMessage,
              "rounded-br-sm":
                !isNextMessageSamePerson && message.isUserMessage,
              "rounded-bl-sm":
                !isNextMessageSamePerson && !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              // prose-invert gives light text: always on the coloured user
              // bubble, and on the assistant bubble only in dark mode.
              <ReactMarkdown
                className={cn("prose prose-sm max-w-none break-words", {
                  "prose-invert": message.isUserMessage,
                  "dark:prose-invert": !message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {message.id !== "loading-message" ? (
              <div
                className={cn("mt-2 w-full select-none text-right text-xs", {
                  "text-muted-foreground": !message.isUserMessage,
                  "text-primary-foreground/70": message.isUserMessage,
                })}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
