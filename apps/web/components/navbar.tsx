import { ExpandingButtonGroup } from "./expanding-button-group"
import { Logo } from "./logo"


export function Navbar() {
  return (
    <div className="absolute top-0 left-0 w-full z-50">
    <div className="w-full h-fit flex items-center bg-red-700/20 backdrop-blur-xs border-b-2 border-red-400/30 z-50 ">
        <div className="flex gap-4 w-fit p-4">
            <Logo size="md" className="pt-2" />
            <ExpandingButtonGroup />
        </div>
    </div>
    </div>
    
  );
}