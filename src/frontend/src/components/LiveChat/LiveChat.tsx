import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid"

export const LiveChat = () => {
    return(
        <div className=" fixed flex w-10 h-10 right-10 bottom-14 sm:right-20 sm:bottom-28 sm:w-14 sm:h-14 bg-[#662483] rounded-full items-center justify-center hover:scale-110 transition-transform ease-in hover:outline-2 outline-dashed outline-offset-4" onClick={()=> {console.log("OK")}}>
            <ChatBubbleLeftRightIcon className="sm:w-8 sm:h-8 w-6 h-6"></ChatBubbleLeftRightIcon>
        </div>
    )
}