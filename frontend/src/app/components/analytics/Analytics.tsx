import { Card } from "../ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

const accuracyData = [
  { week: "Week 1", accuracy: 65 },
  { week: "Week 2", accuracy: 70 },
  { week: "Week 3", accuracy: 75 },
  { week: "Week 4", accuracy: 72 },
  { week: "Week 5", accuracy: 80 },
  { week: "Week 6", accuracy: 85 },
  { week: "Week 7", accuracy: 87 },
];

const xpData = [
  { day: "Mon", xp: 240 },
  { day: "Tue", xp: 380 },
  { day: "Wed", xp: 290 },
  { day: "Thu", xp: 450 },
  { day: "Fri", xp: 520 },
  { day: "Sat", xp: 390 },
  { day: "Sun", xp: 480 },
];

const readinessData = [
  { subject: "Physics", score: 85, fill: "#6366F1" },
  { subject: "Chemistry", score: 72, fill: "#22C55E" },
  { subject: "Math", score: 90, fill: "#F59E0B" },
  { subject: "Biology", score: 78, fill: "#8B5CF6" },
];

const heatmapData = [
  [3, 5, 4, 2, 6, 4, 5],
  [4, 6, 5, 3, 5, 6, 4],
  [2, 4, 3, 5, 4, 3, 6],
  [5, 3, 6, 4, 5, 5, 3],
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Analytics() {
  const getHeatmapColor = (value: number) => {
    const colors = [
      "bg-muted",
      "bg-secondary/20",
      "bg-secondary/40",
      "bg-secondary/60",
      "bg-secondary/80",
      "bg-secondary",
      "bg-secondary",
    ];
    return colors[value] || "bg-muted";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">Track your progress and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <h3 className="text-3xl font-bold mt-1">82%</h3>
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +5% this week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Award className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Study Hours</p>
              <h3 className="text-3xl font-bold mt-1">34.5h</h3>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="text-secondary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Questions Solved</p>
              <h3 className="text-3xl font-bold mt-1">1,247</h3>
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +89 today
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weak Topics</p>
              <h3 className="text-3xl font-bold mt-1">5</h3>
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <TrendingDown size={12} /> Need attention
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ fill: "#22C55E", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Weekly XP</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={xpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="xp" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Study Consistency Heatmap</h3>
          <div className="space-y-2">
            {heatmapData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex gap-2">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`flex-1 h-12 rounded-lg ${getHeatmapColor(
                      day
                    )} flex items-center justify-center text-xs transition-all hover:scale-105 cursor-pointer`}
                    title={`${days[dayIdx]}: ${day} hours`}
                  >
                    {day}h
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between text-xs text-muted-foreground mt-4">
              {days.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Readiness Score by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              innerRadius="20%"
              outerRadius="90%"
              data={readinessData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="score" />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
