import dynamic from 'next/dynamic';
import Link from 'next/link';

const YandexMap = dynamic(() => import('../components/YandexMap'), { ssr: false });

export default function Content() {
  return <main>
    <h1>Яндекс Карта</h1>
    <YandexMap />
    <p><Link href="/">Главная</Link></p>
  </main>;
}
