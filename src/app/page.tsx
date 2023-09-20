import Image from 'next/image';
import footer from 'public/footer.svg';
import Main from './Main';

export default function Home() {
  return (
    <div className='h-screen'>
      <header className='h-1/6'></header>
      <main className='flex justify-center justify-items-center h-4/6 select-none'>
        <Main />
      </main>
      <footer className='flex flex-col justify-between h-1/6 text-xs select-none'>
        <Image src={footer} alt='footer' priority></Image>
        <div className='text-center'>&copy;miaoya</div>
      </footer>
    </div>
  );
}
