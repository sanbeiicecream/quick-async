import Image from 'next/image';
import footer from 'public/footer.svg';
import Main from './Main';

export default function Home() {
  return (
    <div className='h-screen'>
      <Main />
      <footer className='flex flex-col justify-end h-1/6 text-xs select-none'>
        <Image src={footer} alt='footer' priority></Image>
        <div className='text-center'>&copy;miaoya</div>
      </footer>
    </div>
  );
}
