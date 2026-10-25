import { randomUUID } from 'node:crypto';
import { listCommunities, addCommunity } from '../../lib/communities.mjs';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const user = typeof req.query.user === 'string' ? req.query.user.trim() : '';
      return res.status(200).json(user ? await listCommunities(user) : []);
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Метод не поддерживается.' });
    }
    const { user, name, description, avatar } = req.body || {};
    if (![user, name, description, avatar].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ error: 'Заполните все поля и укажите имя пользователя.' });
    }
    if (user.length > 100 || name.length > 100 || description.length > 2000 ||
      !/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar) ||
      avatar.length > 1400000) {
      return res.status(400).json({ error: 'Проверьте поля и выберите изображение размером до 1 МБ.' });
    }
    const community = { id: randomUUID(), name: name.trim(), description: description.trim(),
      avatar, members: [user.trim()] };
    await addCommunity(community);
    return res.status(201).json(community);
  } catch {
    return res.status(500).json({ error: 'Не удалось прочитать или сохранить сообщества.' });
  }
}
