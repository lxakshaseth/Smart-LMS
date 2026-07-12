import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, CheckCircle, Circle, Sparkles, Send, Loader2 } from "lucide-react";
import AddTaskPage, { type NewTask } from "./AddTaskPage";
import { apiRequest } from "../../lib/api";

interface Task {
  id: number;
  title: string;
  subject: string;
  priority: "high" | "medium" | "low";
  day: string;
  completed: boolean;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialTasks: Task[] = [];

export default function Planner() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showAddTask, setShowAddTask] = useState(false);
  
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I am your AI study mentor. I can help you plan your schedule and offer tips to improve your weak subjects. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [weakSubject, setWeakSubject] = useState("");

  // Sync user weak subject and initialize greeting
  useEffect(() => {
    const fetchWeakSubject = async () => {
      try {
        const response = await apiRequest<{ success: boolean; planner: any }>("/planner");
        if (response && response.success && response.planner) {
          const ws = response.planner.weakSubject;
          if (ws) {
            setWeakSubject(ws);
            setMessages([
              {
                sender: "ai",
                text: `Hello! I noticed your current weak subject is **${ws}**. Let's work together to improve your grades. Ask me any study-related questions or tips to prepare for it!`
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch weak subject:", err);
      }
    };
    fetchWeakSubject();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsSending(true);

    try {
      const response = await apiRequest<{ success: boolean; reply: string }>("/planner/chat", {
        method: "POST",
        body: JSON.stringify({ message: userText })
      });

      if (response && response.success) {
        setMessages((prev) => [...prev, { sender: "ai", text: response.reply }]);
      } else {
        throw new Error("Invalid reply");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [...prev, { sender: "ai", text: "I am facing connection issues. Please try again in a moment." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveTask = (newTask: NewTask) => {
    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject,
      priority: newTask.priority,
      day: newTask.day,
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
    setShowAddTask(false);
  };

  if (showAddTask) {
    return (
      <AddTaskPage
        onBack={() => setShowAddTask(false)}
        onSave={handleSaveTask}
        defaultDay={selectedDay}
      />
    );
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-accent/20 text-accent";
      case "low":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-muted";
    }
  };

  const dayTasks = tasks.filter((task) => task.day === selectedDay);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Planner</h1>
          <p className="text-muted-foreground mt-1">Organize your study schedule</p>
        </div>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus size={20} className="mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedDay}'s Tasks</h2>
              <span className="text-sm text-muted-foreground">
                {dayTasks.filter((t) => t.completed).length}/{dayTasks.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {dayTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No tasks scheduled for {selectedDay}</p>
                  <Button variant="ghost" className="mt-4" onClick={() => setShowAddTask(true)}>
                    Add a task
                  </Button>
                </div>
              ) : (
                dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle className="text-secondary" size={24} />
                      ) : (
                        <Circle className="text-muted-foreground" size={24} />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          task.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{task.subject}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((day) => {
              const dayTaskCount = tasks.filter((t) => t.day === day).length;
              const completedCount = tasks.filter((t) => t.day === day && t.completed).length;

              return (
                <Card key={day} className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">{day.slice(0, 3)}</p>
                  <p className="text-sm font-medium">
                    {completedCount}/{dayTaskCount}
                  </p>
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{
                        width: dayTaskCount > 0 ? `${(completedCount / dayTaskCount) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="h-[480px] flex flex-col">
          <div className="flex items-center justify-between border-b pb-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary animate-pulse" size={20} />
              <h3 className="font-bold">AI Suggestions</h3>
            </div>
          </div>

          {/* Chat log feed */}
          <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin flex flex-col">
            <div className="space-y-3 flex-grow">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto rounded-tr-none shadow-sm"
                      : "bg-muted text-foreground rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-muted text-muted-foreground w-fit animate-pulse rounded-tl-none">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Mentor is writing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Input control block */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-3 mt-4 flex-shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask your AI study mentor for advice..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSending}
            />
            <Button type="submit" size="icon" className="h-8 w-8 rounded-xl" disabled={isSending}>
              <Send size={14} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
