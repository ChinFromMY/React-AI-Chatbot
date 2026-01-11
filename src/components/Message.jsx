import { Bot, User } from "lucide-react"

export default function Message({ role, content, timestamp }) {
  return (
    <div className={`message-row ${role}`}>
      <div className="message-avatar">
        {role === "user" ? <User /> : <Bot />}
      </div>

      <div className={`message-bubble ${role}`}>
        <p>{content}</p>
        <span className="message-time">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
