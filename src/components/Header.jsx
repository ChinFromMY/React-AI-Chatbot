import './Header.css'
import chatbotLogo from '../assets/logo.png'


export default function Header(){
    return(
        <header>
            <img src={chatbotLogo}/>
            <h1>AI Chatbot</h1>
        </header>
    )
}