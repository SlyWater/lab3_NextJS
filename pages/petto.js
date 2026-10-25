import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AwesomeSlider from 'react-awesome-slider';
import styles from '../styles/Petto.module.css';

function Animal({ animal }) {
  return <div className={styles.animal}>
    <h2 className={styles.title}>{animal.header}</h2>
    <p className={styles.description}>{animal.content}</p>
    <img className={styles.image} src={'/' + animal.img} alt={animal.header} />
  </div>;
}

export default function Petto() {
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/animals.json')
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setAnimals)
      .catch(() => setError('Не удалось загрузить объявления.'));
    if (!localStorage.getItem('user')) {
      const name = prompt('Введите ваше имя пользователя');
      if (name && name.trim()) localStorage.setItem('user', name.trim());
    }
  }, []);

  function sendEmail(email) {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Обязательно укажите имя пользователя!');
      return;
    }
    const body = 'Здравствуйте, я нашел вашего питомца.\n-----------\nС уважением, ' + user;
    window.location.href = 'mailto:' + email + '?subject=' +
      encodeURIComponent('Потерянный зверь') + '&body=' + encodeURIComponent(body);
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return <main>
    <Head><title>Petto</title></Head>
    <button onClick={logout}>Выйти</button>
    <h1>Petto</h1>
    <p><Link href="/">Главная</Link> | <Link href="/communities">Сообщества</Link></p>
    {error && <p role="alert">{error}</p>}
    <div className={styles.slider}>
      {animals.length > 0 && <AwesomeSlider style={{ '--slider-height-percentage': '100%' }}>
        {animals.map(animal => <div key={animal.email} className={styles.slide}
          onClick={() => sendEmail(animal.email)}>
          <Animal animal={animal} />
        </div>)}
      </AwesomeSlider>}
    </div>
    <footer><p>Petto, (c) 2022</p></footer>
  </main>;
}
