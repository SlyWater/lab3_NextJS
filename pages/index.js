import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AwesomeSlider from 'react-awesome-slider';
import styles from '../styles/Home.module.css';

function sendEmail(email) {
  const body = 'Здравствуйте, я нашел вашего питомца.\n-----------\nС уважением, ' + localStorage.getItem('user');
  window.location.href = 'mailto:' + email + '?subject=' +
    encodeURIComponent('Потерянный зверь') + '&body=' + encodeURIComponent(body);
}

function Animal({ data }) {
  return <div className={styles.animal}>
    <h2 className={styles.header}>{data.header}</h2>
    <p className={styles.content}>{data.content}</p>
    <img className={styles.bgImg} src={'/' + data.img} alt={data.header} />
  </div>;
}

export default function Home() {
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    fetch('/animals.json').then(response => response.json()).then(setAnimals);
    if (!localStorage.getItem('user')) {
      const name = prompt('Введите ваше имя пользователя');
      if (name && name.trim()) localStorage.setItem('user', name.trim());
      else alert('Обязательно укажите имя пользователя!');
    }
  }, []);

  function logout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return <main className={styles.container}>
    <Head>
      <title>Petto</title>
      <meta name="description" content="Социальная сеть для владельцев животных" />
    </Head>
    <button onClick={logout}>Выйти</button>
    <h1>Petto</h1>
    <p><Link href="/content">Карта</Link> | <Link href="/communities">Сообщества</Link></p>
    <div className={styles.slider}>
      {animals.length > 0 && <AwesomeSlider style={{ '--slider-height-percentage': '65%' }}>
        {animals.map(animal => <div key={animal.email} className={styles.slide}
          onClick={() => sendEmail(animal.email)}>
          <Animal data={animal} />
        </div>)}
      </AwesomeSlider>}
    </div>
    <footer className={styles.footer}>Petto, (c) 2022</footer>
  </main>;
}
