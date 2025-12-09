import beachImage1 from '@assets/stock_images/tropical_beach_sunse_8ca4af3b.jpg';
import beachImage2 from '@assets/stock_images/tropical_beach_sunse_17ceeb1b.jpg';
import mountainImage1 from '@assets/stock_images/beautiful_mountain_l_b169310e.jpg';
import mountainImage2 from '@assets/stock_images/beautiful_mountain_l_c1321001.jpg';
import cityImage1 from '@assets/stock_images/city_skyline_night_u_74cb8728.jpg';

export const tripImages = {
    beach1: beachImage1,
    beach2: beachImage2,
    mountain1: mountainImage1,
    mountain2: mountainImage2,
    city1: cityImage1,
};

export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        transportation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        accommodation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        activities: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        other: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
    };
    return colors[category] || colors.other;
}
