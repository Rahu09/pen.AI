import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Message from "./Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";
import { Skeleton } from "../ui/skeleton";

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );

  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  // flex-col-reverse: the newest message is first in the list and sits at the
  // bottom, so the view stays pinned to the latest message as answers stream.
  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col-reverse gap-4 overflow-y-auto p-3">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
        })
      ) : isLoading ? (
        <div
          className="flex w-full flex-col gap-2"
          aria-busy="true"
          aria-label="Loading messages"
        >
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <MessageSquare
            className="h-8 w-8 text-primary"
            aria-hidden="true"
          />
          <h2 className="font-serif text-3xl">
            Ask it <em className="text-primary">anything</em>
          </h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Answers come from this PDF only. If it isn&apos;t in there,
            you&apos;ll be told.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
