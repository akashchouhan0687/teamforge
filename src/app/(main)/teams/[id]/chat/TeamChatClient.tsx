"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Users, User, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { sendTeamMessage, getTeamMessages } from "@/app/actions/chat";

export function TeamChatClient({ team, initialMessages, currentUserId }: any) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Scroll when new messages are added, IF user is near the bottom
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
    
    // If we are within 200px of bottom, auto scroll
    if (scrollHeight - scrollTop - clientHeight < 200) {
      scrollToBottom(true);
    }
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    let intervalId: any;
    
    const fetchNewMessages = async () => {
      try {
        const latest = await getTeamMessages(team.id);
        if (latest.length > 0) {
          // Only update state if length or last message ID changes
          setMessages(prev => {
            const prevLast = prev.length > 0 ? prev[prev.length - 1].id : null;
            const newLast = latest[latest.length - 1].id;
            
            if (prev.length !== latest.length || prevLast !== newLast) {
              return latest;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    // Poll every 5 seconds
    intervalId = setInterval(fetchNewMessages, 5000);
    return () => clearInterval(intervalId);
  }, [team.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = inputValue.trim();
    if (!txt) return;
    if (txt.length > 2000) {
      alert("Message is too long.");
      return;
    }

    setInputValue("");
    setIsSending(true);

    try {
      const newMsg = await sendTeamMessage(team.id, txt);
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      alert(err.message || "Failed to send message");
      setInputValue(txt); // Restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Grouping logic: group consecutive messages by the same sender if within 5 mins
  let currentSenderId: string | null = null;
  let currentGroupTime = 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-background">
      
      {/* HEADER */}
      <header className="shrink-0 sticky top-0 z-10 w-full bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto max-w-5xl px-4 flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/teams/${team.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Team</span>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block mx-2"></div>
            <div>
              <h1 className="font-black text-foreground text-xl md:text-2xl tracking-tight leading-tight flex items-center gap-2">
                {team.name}
              </h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="truncate max-w-[150px] sm:max-w-xs text-foreground bg-muted/50 px-2 py-0.5 rounded-md">{team.project?.title || "No Project"}</span>
                <span>•</span>
                <Users className="h-3 w-3 inline text-primary" />
                <span>{team.members.length} {team.project?.teamSize ? `/ ${team.project.teamSize}` : ""}</span>
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex -space-x-3 mr-4 relative z-0">
              {team.members.slice(0,4).map((m: any) => (
                <div key={m.user.id} className="h-9 w-9 rounded-full bg-muted border-2 border-card overflow-hidden shadow-sm relative z-10 hover:z-20 transition-all hover:scale-110" title={m.user.name}>
                  {m.user.profile?.profileImage || m.user.image ? (
                    <img src={m.user.profile?.profileImage || m.user.image!} alt={m.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs bg-primary/10 text-primary font-black">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {team.members.length > 4 && (
                <div className="h-9 w-9 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs font-black text-muted-foreground shadow-sm relative z-10">
                  +{team.members.length - 4}
                </div>
              )}
            </div>
            <Link href={`/teams/${team.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full font-bold shadow-sm")}>
              View Team Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 container mx-auto max-w-4xl scroll-smooth">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-5 text-muted-foreground pt-10">
            <div className="h-24 w-24 bg-primary/5 text-primary rounded-full flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              <Users className="h-10 w-10 relative z-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground">Start the conversation</h2>
              <p className="mt-2 text-base font-medium max-w-sm mx-auto">Discuss ideas, divide tasks, and build your project together.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              
              const msgTime = new Date(msg.createdAt).getTime();
              // Show sender header if sender changed, or if more than 10 mins passed since last message from same sender
              const showHeader = currentSenderId !== msg.senderId || (msgTime - currentGroupTime > 10 * 60 * 1000);
              
              if (showHeader) {
                currentSenderId = msg.senderId;
                currentGroupTime = msgTime;
              }

              return (
                <div key={msg.id} className={cn("flex flex-col animate-fade-in-up", isMine ? "items-end" : "items-start", showHeader ? "mt-8" : "mt-2")}>
                  
                  {showHeader && (
                    <div className={cn("flex items-end gap-3 mb-2 px-1", isMine ? "flex-row-reverse" : "flex-row")}>
                      {!isMine && (
                        <div className="h-8 w-8 rounded-full bg-muted border border-border/50 overflow-hidden shrink-0 shadow-sm">
                          {msg.sender.profile?.profileImage || msg.sender.image ? (
                            <img src={msg.sender.profile?.profileImage || msg.sender.image!} alt={msg.sender.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xs font-black">
                              {msg.sender.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <span className="text-sm font-bold text-foreground">
                        {isMine ? "You" : msg.sender.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{formatTime(msg.createdAt)}</span>
                    </div>
                  )}

                  <div className={cn(
                    "relative max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-3xl text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all",
                    isMine 
                      ? "bg-primary text-primary-foreground rounded-tr-sm hover:shadow-md" 
                      : "bg-card border border-border/50 rounded-tl-sm text-foreground hover:shadow-md"
                  )}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* COMPOSER */}
      <div className="shrink-0 bg-card/80 backdrop-blur-xl border-t border-border/50 p-4 pb-6 sm:pb-5">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSend} className="relative flex items-end gap-3 rounded-3xl border border-border/60 bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 max-h-32 min-h-[48px] resize-none bg-transparent py-3.5 px-5 text-base font-medium focus:outline-none scrollbar-thin rounded-2xl"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className={cn(
                "h-[48px] w-[48px] shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                inputValue.trim() && !isSending ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
            </button>
          </form>
          <div className="text-[10px] font-bold tracking-widest uppercase text-center text-muted-foreground mt-3">
            Press Enter to send, Shift + Enter for new line. Team messages are private.
          </div>
        </div>
      </div>

    </div>
  );
}
