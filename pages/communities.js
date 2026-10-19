import { useEffect, useState } from 'react';
import Link from 'next/link';
import initialCommunities from '../public/communities.json';

export default function Communities() {
  const [user, setUser] = useState('');
  const [communities, setCommunities] = useState(initialCommunities);
  const [error, setError] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('user') || '';
    setUser(name);
    try {
      const saved = JSON.parse(localStorage.getItem('communities:' + name) || 'null');
      if (Array.isArray(saved)) setCommunities(saved);
    } catch {
      setError('Не удалось прочитать сохранённые сообщества.');
    }
  }, []);

  function createCommunity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.communityName.value.trim();
    const description = form.elements.description.value.trim();
    const avatar = form.elements.avatar.files[0];
    if (!user || !name || !description || !avatar) return;
    setError('');
    const reader = new FileReader();
    reader.onerror = () => setError('Не удалось прочитать аватарку.');
    reader.onload = () => {
      const community = { id: Date.now(), name, description, avatar: reader.result, members: [user] };
      const next = [...communities, community];
      try {
        localStorage.setItem('communities:' + user, JSON.stringify(next));
        setCommunities(next);
        form.reset();
      } catch {
        setError('Не удалось сохранить сообщество. Попробуйте аватарку меньшего размера.');
      }
    };
    reader.readAsDataURL(avatar);
  }

  const myCommunities = communities.filter(community => community.members.includes(user));

  return <main>
    <h1>Сообщества</h1>
    {user ? <>
      <p>Сообщества пользователя: {user}</p>
      {myCommunities.length === 0 && <p>Вы пока не состоите в сообществах.</p>}
      {myCommunities.map(community => <section key={community.id}>
        <h2>{community.name}</h2>
        <p>{community.description}</p>
        <img src={community.avatar} alt={community.name} width={80} height={80} />
      </section>)}
      <h2>Создать сообщество</h2>
      <form onSubmit={createCommunity}>
        <p><label>Название: <input name="communityName" required /></label></p>
        <p><label>Описание: <textarea name="description" required /></label></p>
        <p><label>Аватарка: <input name="avatar" type="file" accept="image/*" required /></label></p>
        <button type="submit">Создать</button>
      </form>
    </> : <p>Укажите имя пользователя на главной странице.</p>}
    {error && <p role="alert">{error}</p>}
    <Link href="/">Главная</Link>
  </main>;
}
