'use client';
import Image from 'next/image';
import useState from 'react-usestateref';
import userPic from '../public/user.webp';
import botPic from '../public/bot.png';

enum Creator {
  Me = 0,
  Bot = 1
}

interface MessageProps{
  text: string;
  from: Creator;
  key: number;
}
interface InputProps{
  onSend: (input:string)=>void;
  disable: boolean;
}

// One message int he chat
const ChatMessage = ({text, from}: MessageProps) =>{
  return (
    <>
      {from == Creator.Me && (
        <div className="bg-white p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <Image src={userPic} alt="User" width={40} />
          <p className="text-grey-700">{text}</p>
        </div>
      )}
      {from == Creator.Bot && (

          <div className="bg-grey-100 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <Image src={botPic} alt="User" width={40} />
          <p className="text-grey-700">{text}</p>
          </div>
      )}
    </>
  );
};

// The chat input field
const ChatInput = ({onSend , disable}: InputProps)=>{
  const [input,setInput] = useState('');

  const sendInput = () =>{
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (event:any)=>{
    if(event.keyCode === 13){
      sendInput();
    }
  };

  return (
    <div className="bg-white border-2 p-2 rounded-lg flex justify-center">
      <input
        value={input}
        onChange={(ev:any)=>setInput(ev.target.value)}
        className="w-full py-2 px-3 text-grey-800 rounded-lg focus:outline-none"
        type="text"
        placeholder='Ask me anything'
        disabled={disable}
        onKeyDown={(ev)=> handleKeyDown(ev)}
      />
      {disable && (
        <svg 
          aria-hidden="true"
          className="mt-1 w-8 h-8 mr-2 text-grey-200 animate-spin fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
              d = "M100 50.5908c100 78.2051 77.61.42 100.591 50 100.591C22.3858 100.591 0 78."
              fill="currentColor"
          />
          <path
              d = "M100 50.5908c100 78.2051 77.61.42 100.591 50 100.591C22.3858 100.591 0 78."
              fill="currentFill"
          />          
        </svg>
      )}
      {!disable && (
        <button
        onClick={()=> sendInput()}
        className="p-2 rounded-md text-grey-500 bottom=1.5 right-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill='none'
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 "
            />

          </svg>
        </button>
      )}

    </div>
  )

};

// page
export default function Home(){
  const [messages, setMessages, messageRef] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState(false);

  const callApi = async (input:string)=>{
    setLoading(true);

    const myMessage: MessageProps = {
      text: input,
      from: Creator.Me,
      key: new Date().getTime()
    };

    setMessages([...messageRef.current, myMessage]);
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input
      })
    }).then((response)=> response.json());
    setLoading(false);

    if(response.text){
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.Bot,
        key: new Date().getTime()
      };
      setMessages([...messageRef.current, botMessage]);
    }else{
      // show error
    }
};
  return (
    <main className="relative max-w-2xl mx-auto">
      <div className="stricky top-0 w-full pt-10 px-4">
        <ChatInput onSend={(input) => callApi(input)} disable={loading}/>
      </div>

      <div className="mt-10 px-4">
        {messages.map((msg : MessageProps) => (
          <ChatMessage key={msg.key} text={msg.text} from={msg.from}/>
        ))}
          {messages.length == 0 && <p className="text-center text-grey-400">I am at your service</p>}
      </div>
    </main>
  );
}
