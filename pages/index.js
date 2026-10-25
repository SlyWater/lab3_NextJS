import Link from 'next/link';

export default function Home() {
  return <main>
    <h1>Главная</h1>
    <p>Куликовский Вадим Алексеевич</p>
    <p>Николаев Александр Владимирович</p>
    <p>Группа 23ВВИ1</p>
    <p><Link href="/content">Яндекс Карта</Link></p>
    <p><Link href="/petto">Petto</Link></p>
  </main>;
}
