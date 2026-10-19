import { YMaps, Map } from 'react-yandex-maps';

export default function YandexMap() {
  return <YMaps query={{ apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY, lang: 'ru_RU' }}>
    <Map defaultState={{ center: [53.1959, 45.0183], zoom: 12 }} width="100%" height={450} />
  </YMaps>;
}
