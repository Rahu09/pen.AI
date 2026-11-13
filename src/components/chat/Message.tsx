import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef, type ComponentProps } from "react";
import { linkCitations, pageFromHref } from "@/lib/citations";
import { usePdfNavigation } from "@/components/file/pdf-navigation";

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
              // react-markdown 9+ takes no className, so the prose styles
              // sit on a wrapper.
              <div
                className={cn("prose prose-sm max-w-none break-words", {
                  "prose-invert": message.isUserMessage,
                  "dark:prose-invert": !message.isUserMessage,
                })}
              >
                {message.isUserMessage ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  // Answers cite pages as "[p. 3]"; those become links
                  // here and render as buttons that open that page.
                  <ReactMarkdown components={{ a: AnswerLink }}>
                    {linkCitations(message.text)}
                  </ReactMarkdown>
                )}
              </div>
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

/**
 * Links inside an answer. A page citation ("#page-3", see lib/citations)
 * becomes a small button that moves the PDF viewer to that page; any other
 * link opens in a new tab.
 */
function AnswerLink({ href, children }: ComponentProps<"a">) {
  const goToPage = usePdfNavigation();
  const page = pageFromHref(href);

  if (page === null) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  const label = (
    <span className="not-prose inline-flex items-center rounded border border-foreground/15 bg-background/60 px-1.5 py-px align-baseline text-xs font-medium tabular-nums">
      p. {page}
    </span>
  );

  // Outside a file page there is no viewer to move.
  if (!goToPage) return label;

  return (
    <button
      type="button"
      onClick={() => goToPage(page)}
      title={`Show page ${page} of the PDF`}
      aria-label={`Show page ${page} of the PDF`}
      className="rounded outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&>span]:hover:border-primary/50"
    >
      {label}
    </button>
  );
}

export default Message;
