import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Communities() {
  const [user, setUser] = useState('');
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('user') || '';
    setUser(name);
    if (!name) return;
    fetch('/api/communities?user=' + encodeURIComponent(name))
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCommunities(data);
      })
      .catch(error => setError(error.message));
  }, []);

  async function createCommunity(event) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const file = form.elements.avatar.files[0];
    const name = form.elements.communityName.value.trim();
    const description = form.elements.description.value.trim();
    if (!name || !description) {
      setError('Заполните название и описание.');
      return;
    }
    if (!file || file.size > 1024 * 1024) {
      setError('Выберите изображение размером до 1 МБ.');
      return;
    }
    setSaving(true);
    try {
      const avatar = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Не удалось прочитать аватарку.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/communities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, name, description, avatar })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCommunities(current => [...current, data]);
      form.reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <main>
    <h1>Сообщества</h1>
    {user ? <>
      <p>Пользователь: {user}</p>
      {communities.length === 0 && <p>Вы пока не состоите в сообществах.</p>}
      {communities.map(community => <section key={community.id}>
        <h2>{community.name}</h2>
        <p>{community.description}</p>
        <img src={community.avatar} alt={community.name} width={80} height={80} />
      </section>)}
      <h2>Создать сообщество</h2>
      <form onSubmit={createCommunity}>
        <p><label>Название: <input name="communityName" maxLength={100} required /></label></p>
        <p><label>Описание: <textarea name="description" maxLength={2000} required /></label></p>
        <p><label>Аватарка: <input name="avatar" type="file" accept="image/png,image/jpeg,image/gif,image/webp" required /></label></p>
        <button type="submit" disabled={saving}>Создать</button>
      </form>
    </> : <p>Укажите имя пользователя на странице Petto.</p>}
    {error && <p role="alert">{error}</p>}
    <p><Link href="/petto">Petto</Link> | <Link href="/">Главная</Link></p>
  </main>;
}
