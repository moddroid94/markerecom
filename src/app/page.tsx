"use client";
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';

const NeonShift3D = dynamic(() => import('@/components/neon-shift-3d').then(mod => mod.NeonShift3D), {
  ssr: false,
});

export default function Home() {
  let fadeon = setTimeout(() => {
    let prel = document.getElementById('pretext')
    prel.className = "text-white transition opacity-100"
    gsap.to("#logosvg", {duration:1, delay:0.5, margin:0, scale:1})
  }, 20);
  

  return (
    <div className="h-full bg-transparent ">
      <div id="reload" className="fixed flex top-0 bg-transparent backdrop-blur-sm w-full h-20 z-10 opacity-0">
        <div className="items-center justify-center p-2 flex w-full h-full mt-[22rem] scale-[200%]">
          <a className="z-99" href="">
            <svg className="fill-white" width="214.8" height="35" viewBox="0 0 214.8 75" xmlns="http://www.w3.org/2000/svg"><g><path d="M 109 75 L 109 2 L 118 2 L 123.2 39.8 L 123.8 39.8 L 128.5 0 L 138.2 0 L 138.2 73 L 131.6 73 L 133.8 6.9 L 133.4 6.9 L 124.7 54.9 L 121.7 54.9 L 114.6 12 L 114.2 12 L 114.2 75 L 109 75 Z M 16.1 73 L 16.1 2 L 27.7 2 L 36.7 67.2 L 37.1 67.2 L 39.3 2 L 45.1 2 L 44.1 73 L 32.6 73 L 22.4 7.9 L 22 7.9 L 22 73 L 16.1 73 Z M 143 73 L 143 2 L 154.6 2 L 163.6 67.2 L 164 67.2 L 166.2 2 L 172 2 L 171 73 L 159.5 73 L 149.3 7.9 L 148.9 7.9 L 148.9 73 L 143 73 Z M 52.7 75 L 50.4 4 L 58.2 4 L 58.2 34 L 60.8 35.5 L 65.3 31.9 L 66.3 2 L 74.9 2 L 70.7 34.4 L 65.9 37.6 L 72.8 41.6 L 73.9 75 L 65.9 75 L 65.9 46.6 L 60.5 41.6 L 59.4 42.4 L 59.4 75 L 52.7 75 Z M 192 73 L 196.5 2 L 214.8 2 L 214.8 73 L 209 73 L 206.4 45.2 L 201.3 45.2 L 196.7 73 L 192 73 Z M 86.7 73 L 80.8 68.8 L 80.8 5.2 L 85.1 2 L 98.6 2 L 102.6 4.8 L 102.6 69.4 L 96.3 73 L 86.7 73 Z M 1.8 73 L 1.8 11.4 L 0 6.6 L 0 2 L 10.1 2 L 9.2 73 L 1.8 73 Z M 178.3 73 L 178.3 11.4 L 176.5 6.6 L 176.5 2 L 186.6 2 L 185.7 73 L 178.3 73 Z M 89.8 66 L 94 66 Q 94.9 66 94.9 65.4 L 95.9 8.1 Q 95.9 7.2 95 7.2 L 89.8 7.2 Q 88.9 7.2 88.9 8.1 L 88.9 65.4 Q 88.9 66 89.8 66 Z M 203.6 40.5 L 207.9 40.5 Q 208.5 40.5 208.5 39.9 L 208.5 5.8 Q 208.5 5.2 207.9 5.2 L 203.6 5.2 Q 203 5.2 203 5.8 L 203 40 Q 203 40.5 203.6 40.5 Z" /></g></svg>
          </a>
        </div>
      </div>
      <div className="fixed flex top-0 bg-transparent backdrop-blur-sm w-full h-20 z-10">
        <div id="logosvg" className="items-center justify-center p-2 flex w-full h-full mt-[22rem] scale-[200%]">
          <a href="">
            <svg className="fill-white" width="214.8" height="35" viewBox="0 0 214.8 75" xmlns="http://www.w3.org/2000/svg"><g><path d="M 109 75 L 109 2 L 118 2 L 123.2 39.8 L 123.8 39.8 L 128.5 0 L 138.2 0 L 138.2 73 L 131.6 73 L 133.8 6.9 L 133.4 6.9 L 124.7 54.9 L 121.7 54.9 L 114.6 12 L 114.2 12 L 114.2 75 L 109 75 Z M 16.1 73 L 16.1 2 L 27.7 2 L 36.7 67.2 L 37.1 67.2 L 39.3 2 L 45.1 2 L 44.1 73 L 32.6 73 L 22.4 7.9 L 22 7.9 L 22 73 L 16.1 73 Z M 143 73 L 143 2 L 154.6 2 L 163.6 67.2 L 164 67.2 L 166.2 2 L 172 2 L 171 73 L 159.5 73 L 149.3 7.9 L 148.9 7.9 L 148.9 73 L 143 73 Z M 52.7 75 L 50.4 4 L 58.2 4 L 58.2 34 L 60.8 35.5 L 65.3 31.9 L 66.3 2 L 74.9 2 L 70.7 34.4 L 65.9 37.6 L 72.8 41.6 L 73.9 75 L 65.9 75 L 65.9 46.6 L 60.5 41.6 L 59.4 42.4 L 59.4 75 L 52.7 75 Z M 192 73 L 196.5 2 L 214.8 2 L 214.8 73 L 209 73 L 206.4 45.2 L 201.3 45.2 L 196.7 73 L 192 73 Z M 86.7 73 L 80.8 68.8 L 80.8 5.2 L 85.1 2 L 98.6 2 L 102.6 4.8 L 102.6 69.4 L 96.3 73 L 86.7 73 Z M 1.8 73 L 1.8 11.4 L 0 6.6 L 0 2 L 10.1 2 L 9.2 73 L 1.8 73 Z M 178.3 73 L 178.3 11.4 L 176.5 6.6 L 176.5 2 L 186.6 2 L 185.7 73 L 178.3 73 Z M 89.8 66 L 94 66 Q 94.9 66 94.9 65.4 L 95.9 8.1 Q 95.9 7.2 95 7.2 L 89.8 7.2 Q 88.9 7.2 88.9 8.1 L 88.9 65.4 Q 88.9 66 89.8 66 Z M 203.6 40.5 L 207.9 40.5 Q 208.5 40.5 208.5 39.9 L 208.5 5.8 Q 208.5 5.2 207.9 5.2 L 203.6 5.2 Q 203 5.2 203 5.8 L 203 40 Q 203 40.5 203.6 40.5 Z" /></g></svg>
          </a>
        </div>
      </div>
      <main className="relative bg-transparent z-0 h-full">
        
        <div className="w-full h-full bg-transparent fixed top-0 left-0 z-0">
          <NeonShift3D />
        </div>
      </main>
      <div className="hidden fixed flex bottom-0 bg-transparent w-full h-12 z-10  p-2">
        <div className="items-center justify-start p-3 backdrop-blur-sm ring-1 ring-gray-800/40 rounded-md flex w-full h-full">
          <a className="font-light text-md" href="">MENU</a>
        </div>
      </div>

      <div id="preloader" className="fixed top-0 left-0 z-99 bg-black w-full h-full">
        <div className="flex w-full h-full items-center justify-center">
          <div id="pretext" className="text-white transition opacity-0" >LOADING</div>
        </div>
      </div>
    </div>
  );
}
