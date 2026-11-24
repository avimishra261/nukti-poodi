import { IndoreArea } from './types';

export const INDORE_CENTER: [number, number] = [22.7196, 75.8577];

export const INDORE_AREAS: IndoreArea[] = [
  { name: 'Vijay Nagar', hindiName: 'विजय नगर', lat: 22.7533, lng: 75.8937 },
  { name: 'Scheme 54', hindiName: 'स्कीम 54', lat: 22.7495, lng: 75.8878 },
  { name: 'Rajwada', hindiName: 'राजवाड़ा', lat: 22.7186, lng: 75.8557 },
  { name: 'Sarafa', hindiName: 'सराफा', lat: 22.7176, lng: 75.8543 },
  { name: 'Khajrana', hindiName: 'खजराना', lat: 22.7295, lng: 75.9083 },
  { name: 'Annapurna', hindiName: 'अन्नपूर्णा', lat: 22.6953, lng: 75.8398 },
  { name: 'Bhawarkua', hindiName: 'भंवरकुआं', lat: 22.6926, lng: 75.8676 },
  { name: 'Palasia', hindiName: 'पलासिया', lat: 22.7244, lng: 75.8839 },
  { name: 'Malharganj', hindiName: 'मल्हारगंज', lat: 22.7194, lng: 75.8442 },
  { name: 'Bada Ganpati', hindiName: 'बड़ा गणपति', lat: 22.7199, lng: 75.8414 },
  { name: 'Sudama Nagar', hindiName: 'सुदामा नगर', lat: 22.6911, lng: 75.8295 },
  { name: 'Nipania', hindiName: 'निपानिया', lat: 22.7712, lng: 75.9102 },
  { name: 'Bengali Square', hindiName: 'बंगाली चौराहा', lat: 22.7261, lng: 75.9154 },
  { name: 'MR-10', hindiName: 'एमआर-10', lat: 22.7604, lng: 75.8832 },
  { name: 'LIG', hindiName: 'एलआईजी', lat: 22.7351, lng: 75.8856 },
  { name: 'MG Road', hindiName: 'एमजी रोड', lat: 22.7198, lng: 75.8669 },
  { name: 'Geeta Bhawan', hindiName: 'गीता भवन', lat: 22.7166, lng: 75.8825 },
  { name: 'Aerodrome Road', hindiName: 'एरोड्रम रोड', lat: 22.7279, lng: 75.8184 },
  { name: 'Pardesipura', hindiName: 'परदेशीपुरा', lat: 22.7376, lng: 75.8659 },
  { name: 'Musakhedi', hindiName: 'मूसाखेड़ी', lat: 22.7016, lng: 75.8998 },
  { name: 'Rajendra Nagar', hindiName: 'राजेंद्र नगर', lat: 22.6776, lng: 75.8271 },
  { name: 'Rau', hindiName: 'राऊ', lat: 22.6416, lng: 75.8058 },
  { name: 'Bicholi', hindiName: 'बिचौली', lat: 22.6962, lng: 75.9182 },
  { name: 'Super Corridor', hindiName: 'सुपर कॉरिडोर', lat: 22.7652, lng: 75.8066 },
  { name: 'Other', hindiName: 'अन्य इंदौर', lat: 22.7196, lng: 75.8577 },
];

export const FOOD_CHIP_OPTIONS: string[] = [
  'Nukti',
  'Poodi',
  'Aloo Sabzi',
  'Kheer',
  'Halwa',
  'Dal Bafla',
  'Ladoo',
  'Kadhi',
  'Chawal',
  'Chole',
  'Khichdi',
  'Sabudana',
  'Malpua',
  'Chaas',
  'Prasad',
];

export const QUICK_FOOD_FILTERS: { label: string; keyword: string; emoji: string }[] = [
  { label: 'Sabhi', keyword: '', emoji: '✨' },
  { label: 'Nukti-Poodi', keyword: 'Nukti', emoji: '🟡' },
  { label: 'Kheer-Poodi', keyword: 'Kheer', emoji: '🥣' },
  { label: 'Dal-Bafla', keyword: 'Dal Bafla', emoji: '🟠' },
  { label: 'Halwa', keyword: 'Halwa', emoji: '🍮' },
  { label: 'Khichdi', keyword: 'Khichdi', emoji: '🍛' },
  { label: 'Chaas / Kadhi', keyword: 'Kadhi', emoji: '🥛' },
];
