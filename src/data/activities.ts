import { ActivityCardData, ObjectMatchQuestion, RoutineStep } from '../types.ts';

export const HUB_ACTIVITIES: ActivityCardData[] = [
  {
    id: 'photo-recall',
    titleAs: 'ঘৰৰ স্মৃতি',
    titleEn: 'Photo Recall',
    subtitleAs: 'পৰিয়ালৰ চিনাকী মানুহবোৰ চাওক',
    subtitleEn: 'Recognize familiar family faces',
    badgeAs: '৩ খন ফটো সাজু',
    badgeEn: '3 photos ready',
    badgeIcon: 'collections',
    badgeColorClass: 'text-[#00524d] dark:text-[#5eead4]',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA',
    imageAlt: 'Assamese grandmother and granddaughter sharing warm tea together on a tranquil sunlit veranda'
  },
  {
    id: 'daily-routine',
    titleAs: 'দৈনন্দিন নিয়ম',
    titleEn: 'Daily Routine Order',
    subtitleAs: 'দিনটোৰ নিয়মবোৰ সজাওঁ আহক',
    subtitleEn: 'Arrange familiar daily steps',
    badgeAs: 'চাহ বনোৱাৰ নিয়ম',
    badgeEn: 'Tea routine',
    badgeIcon: 'coffee',
    badgeColorClass: 'text-[#9c4328] dark:text-[#f87171]',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvMT20wvk9EX9IzK5VSUcvCTvOHIK3trS_IMjdIa1n-29gM9DWhXWn6mglOMADC3hGn2R8fMjjmyNPofgiMPA_qSOTDJTbwBmzJmckctOYWuaXFhMur63wsE8Xt5j6RywBm2U0goWNxxHD27Z0hnXrFLrtMqh3jsg0OBte8rUYPYjnUr5H59Mds-9VGh1aP806TpSOcRU1DGsONtjPAQCFFaw0KDw61Ij-3Wq2_A1aRxDo3xm6o70MIw',
    imageAlt: 'Clay kettle warming on traditional earthen hearth in authentic rural kitchen'
  },
  {
    id: 'object-match',
    titleAs: 'বস্তুৰ মিল',
    titleEn: 'Familiar Object Match',
    subtitleAs: 'চিনাকী কাঁহ-পিতলৰ বাচন চিনক',
    subtitleEn: 'Match traditional household items',
    badgeAs: 'কাঁহৰ বাচন',
    badgeEn: 'Bell-metal items',
    badgeIcon: 'workspace_premium',
    badgeColorClass: 'text-[#00524d] dark:text-[#5eead4]',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAKQsreXEz48tUQrjf9y5eoZMyvKw2OjPirK60sYJUWeeu8Esu7rwMEZytKHxtR5M7J5aRLjALoSj7jbC9mrg0EwyKv66nlUm71jh4-f318ctIPtbZBXQ0dXpWwIRrgymyjDSXrfSnwLxUQWe1ZqD5IXNcZm6kTQr3sKT2G4KqOjItApbRI7KtlOxLsOiQCU2uoQdMnAHfivxddeRVWKxn5ead43Helfq_d-nw-4LwHrJQ6yyQiNFunw',
    imageAlt: 'Traditional Assamese handcrafted bell-metal brass bowl on natural woven bamboo mat'
  }
];

export const OBJECT_MATCH_QUESTIONS: ObjectMatchQuestion[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    totalSteps: 3,
    titleAs: 'একে কাঁহৰ বাচনখন বিচাৰি উলিয়াওক',
    titleEn: 'Find the matching bell-metal cup below',
    targetTitleAs: 'কাঁহৰ বাটি',
    targetTitleEn: 'Traditional Bell-metal Cup',
    instructionAs: 'এইটোৰ দৰে একে বাচনখন তলত বাছক',
    instructionEn: 'Tap the item that looks just like this',
    targetImageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKXlHIkId0YcBqjtdO4zwj2xnVmAahddDkARwip7VG4KXijwSieV9ceP3rM74WdLzb-qNfuLHaqZeItREF_cfeiiSNgS4zJkedUr1ep9JHlFCk5U63TOzpfZVLBWml21p-Hjn1jEle-IQ8M4DjE3sLmyg-bQEn9T1tSy299Xh9vncquXq9r8HLdvOBteZm9bsHLj-gtOc0sBAGcQ3He3aNzf7Qkkxrl4wk2yapFXWOjnlvW11Y5WSPtg',
    targetImageAlt: 'Authentic traditional Assamese bell metal drinking cup on woven bamboo mat with golden glow',
    options: [
      {
        id: 'opt-cup',
        titleAs: 'কাঁহৰ বাটি',
        titleEn: 'Bell-metal cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYafon5qLDq4hKmGrAOkB8qngh3iqBf7536WvHvDY5tySgf8CMPkUDIpsb2nMWtYX1TJsYBPUgADPa8yvMVHIsrv7T5C669QEkmPHpHziGc5rlPRb3bgsLtQyqx8OoIi3SvnKK7ttDpEoLNRSwdoDcjElore36Pn1DYqAA4KX7f02fOtxaVztqYHCmphrSe_V7EeYLz78zDQ22X_gxI5qqcYG-1zvejblOc_KTXdnbrcDHvYyWXZVY7g',
        imageAlt: 'Traditional Assamese bell-metal cup on woven surface',
        isCorrect: true
      },
      {
        id: 'opt-gamosa',
        titleAs: 'ফুলাম গামোচা',
        titleEn: 'Gamosa cloth',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr6u665tpmLQnz07FS1DcC1BfP_aZghar3sHq0Cvzw_1C5JIiXgQ9VfWKo4ZAAtOIbunm3SY4A0dX7mlFuqT9fBvhwC1_RusCLCiTZQcuwUGFDcOcoVabRCGQ06yZwqYIM8iddLUIJqusoGqVvUNd5oe0z_TzeFPxCwfH3xG6soXhZMzbif1_KElTSQgNsW-r4EJgSrlVRXjpD3Bkh7XnhcD1fIeF3UKqTHenDYy53Yj3LW4MPAC-zA',
        imageAlt: 'Traditional handwoven Assamese red and white Gamosa cotton textile',
        isCorrect: false
      },
      {
        id: 'opt-fan',
        titleAs: 'বাঁহৰ বিচনী',
        titleEn: 'Bamboo hand fan',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNtGSCJeZ6VulYlpJM0tRfkC_RYUSbaeC0jv-epLl1KfBfuybFSv3OGecu5q9XaiV9jkYk7z28X-7xvy1XvCI_eK0HWy1onObRtBYGHaH0GrDhUqZjGwNOqGc6nZCIR4XVgOyn0XEUQKfQLtJPQguB05-6yG9xqaZPz_BguXBwEewHcqLuE2vgUvm67vvC_aB99ZOJelrdnkZReSrX1aDvwggc_9GAif_1pbW56BCNuEfxkjr1w0j3A',
        imageAlt: 'Handcrafted woven bamboo hand fan resting on wooden table',
        isCorrect: false
      },
      {
        id: 'opt-clay',
        titleAs: 'মাটিৰ কাপ',
        titleEn: 'Clay tea cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFIbJGx8FMUEmzb0TZjsHKeaAHje17Zb5YeNqyMiftDZQQnf8BIoVPdbucLVXKKJvAjHl0VP2VVecSETlRjpfRJEf-bTuMt-NvXtrFtZ3OZCsNYiM7ooX0swCg-AcLfgBWbNGKDvvHc0ny3o2YMzsKRgbyR_ShINRSReWTEuZWivkBqFnAapuYCng_cl-uYY59xyd_8S4rssPUrW0qCsr3jQkFlQ4SZYUwt0fpWjpX3AgvC_E5cKlfJw',
        imageAlt: 'Earthy terracotta clay tea cup kulhad on a wooden veranda table',
        isCorrect: false
      }
    ],
    successMessageAs: 'সুন্দৰ হৈছে! কাঁহৰ বাটি একেবাৰে মিলি গʼল।',
    successMessageEn: 'Wonderful! You matched the bell-metal cup perfectly.',
    gentleGuidanceAs: 'কোনো কথা নাই আইতা, ওপৰৰ সোণালী কাঁহৰ বাটিটো পুনৰ চাওঁক।',
    gentleGuidanceEn: 'No problem, take another gentle look at the golden cup above.',
    hintAs: 'ইঙ্গিত: সোণালী ৰং আৰু উজ্জ্বল কাঁহৰ বাতিটো বাছক।',
    hintEn: 'Hint: Choose the shiny bell-metal cup with the golden brass tone.'
  },
  {
    id: 'step-2',
    stepNumber: 2,
    totalSteps: 3,
    titleAs: 'গৰম দিনত বতাহ লোৱা বিচনীখন বিচাৰি উলিয়াওক',
    titleEn: 'Find the soothing bamboo hand fan below',
    targetTitleAs: 'বাঁহৰ বিচনী',
    targetTitleEn: 'Bamboo Hand Fan (Bichoni)',
    instructionAs: 'বতাহ লোৱা বাঁহৰ বিচনীখন তলত বাছক',
    instructionEn: 'Tap the cooling bamboo hand fan below',
    targetImageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNtGSCJeZ6VulYlpJM0tRfkC_RYUSbaeC0jv-epLl1KfBfuybFSv3OGecu5q9XaiV9jkYk7z28X-7xvy1XvCI_eK0HWy1onObRtBYGHaH0GrDhUqZjGwNOqGc6nZCIR4XVgOyn0XEUQKfQLtJPQguB05-6yG9xqaZPz_BguXBwEewHcqLuE2vgUvm67vvC_aB99ZOJelrdnkZReSrX1aDvwggc_9GAif_1pbW56BCNuEfxkjr1w0j3A',
    targetImageAlt: 'Handcrafted woven bamboo hand fan',
    options: [
      {
        id: 'opt-fan-2',
        titleAs: 'বাঁহৰ বিচনী',
        titleEn: 'Bamboo hand fan',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNtGSCJeZ6VulYlpJM0tRfkC_RYUSbaeC0jv-epLl1KfBfuybFSv3OGecu5q9XaiV9jkYk7z28X-7xvy1XvCI_eK0HWy1onObRtBYGHaH0GrDhUqZjGwNOqGc6nZCIR4XVgOyn0XEUQKfQLtJPQguB05-6yG9xqaZPz_BguXBwEewHcqLuE2vgUvm67vvC_aB99ZOJelrdnkZReSrX1aDvwggc_9GAif_1pbW56BCNuEfxkjr1w0j3A',
        imageAlt: 'Bamboo hand fan',
        isCorrect: true
      },
      {
        id: 'opt-clay-2',
        titleAs: 'মাটিৰ কাপ',
        titleEn: 'Clay tea cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFIbJGx8FMUEmzb0TZjsHKeaAHje17Zb5YeNqyMiftDZQQnf8BIoVPdbucLVXKKJvAjHl0VP2VVecSETlRjpfRJEf-bTuMt-NvXtrFtZ3OZCsNYiM7ooX0swCg-AcLfgBWbNGKDvvHc0ny3o2YMzsKRgbyR_ShINRSReWTEuZWivkBqFnAapuYCng_cl-uYY59xyd_8S4rssPUrW0qCsr3jQkFlQ4SZYUwt0fpWjpX3AgvC_E5cKlfJw',
        imageAlt: 'Clay cup',
        isCorrect: false
      },
      {
        id: 'opt-gamosa-2',
        titleAs: 'ফুলাম গামোচা',
        titleEn: 'Gamosa cloth',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr6u665tpmLQnz07FS1DcC1BfP_aZghar3sHq0Cvzw_1C5JIiXgQ9VfWKo4ZAAtOIbunm3SY4A0dX7mlFuqT9fBvhwC1_RusCLCiTZQcuwUGFDcOcoVabRCGQ06yZwqYIM8iddLUIJqusoGqVvUNd5oe0z_TzeFPxCwfH3xG6soXhZMzbif1_KElTSQgNsW-r4EJgSrlVRXjpD3Bkh7XnhcD1fIeF3UKqTHenDYy53Yj3LW4MPAC-zA',
        imageAlt: 'Gamosa cloth',
        isCorrect: false
      },
      {
        id: 'opt-cup-2',
        titleAs: 'কাঁহৰ বাটি',
        titleEn: 'Bell-metal cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYafon5qLDq4hKmGrAOkB8qngh3iqBf7536WvHvDY5tySgf8CMPkUDIpsb2nMWtYX1TJsYBPUgADPa8yvMVHIsrv7T5C669QEkmPHpHziGc5rlPRb3bgsLtQyqx8OoIi3SvnKK7ttDpEoLNRSwdoDcjElore36Pn1DYqAA4KX7f02fOtxaVztqYHCmphrSe_V7EeYLz78zDQ22X_gxI5qqcYG-1zvejblOc_KTXdnbrcDHvYyWXZVY7g',
        imageAlt: 'Bell-metal cup',
        isCorrect: false
      }
    ],
    successMessageAs: 'বৰ ধুনীয়া! বাঁহৰ বিচনীখন চিনাক্ত হʼল।',
    successMessageEn: 'Wonderful! You found the cooling bamboo fan.',
    gentleGuidanceAs: 'কোনো কথা নাই, ঘূৰণীয়া বাঁহৰ সজোঁৱা বিচনীখন লক্ষ্য কৰক।',
    gentleGuidanceEn: 'Take your time, look for the round woven bamboo fan.',
    hintAs: 'ইঙ্গিত: বাঁহেৰে গুঁঠা বিচনীখন বাছক।',
    hintEn: 'Hint: Tap the woven bamboo hand fan.'
  },
  {
    id: 'step-3',
    stepNumber: 3,
    totalSteps: 3,
    titleAs: 'আদৰেৰে দিয়া ফুলাম গামোচাখন বিচাৰি উলিয়াওক',
    titleEn: 'Find the traditional woven Gamosa cloth',
    targetTitleAs: 'ফুলাম গামোচা',
    targetTitleEn: 'Traditional Phulam Gamosa',
    instructionAs: 'বগা আৰু ৰঙা ফুলৰ গামোচাখন তলত বাছক',
    instructionEn: 'Tap the woven cloth with red floral borders',
    targetImageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr6u665tpmLQnz07FS1DcC1BfP_aZghar3sHq0Cvzw_1C5JIiXgQ9VfWKo4ZAAtOIbunm3SY4A0dX7mlFuqT9fBvhwC1_RusCLCiTZQcuwUGFDcOcoVabRCGQ06yZwqYIM8iddLUIJqusoGqVvUNd5oe0z_TzeFPxCwfH3xG6soXhZMzbif1_KElTSQgNsW-r4EJgSrlVRXjpD3Bkh7XnhcD1fIeF3UKqTHenDYy53Yj3LW4MPAC-zA',
    targetImageAlt: 'Traditional handwoven Assamese red and white Gamosa cotton textile',
    options: [
      {
        id: 'opt-clay-3',
        titleAs: 'মাটিৰ কাপ',
        titleEn: 'Clay tea cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFIbJGx8FMUEmzb0TZjsHKeaAHje17Zb5YeNqyMiftDZQQnf8BIoVPdbucLVXKKJvAjHl0VP2VVecSETlRjpfRJEf-bTuMt-NvXtrFtZ3OZCsNYiM7ooX0swCg-AcLfgBWbNGKDvvHc0ny3o2YMzsKRgbyR_ShINRSReWTEuZWivkBqFnAapuYCng_cl-uYY59xyd_8S4rssPUrW0qCsr3jQkFlQ4SZYUwt0fpWjpX3AgvC_E5cKlfJw',
        imageAlt: 'Clay cup',
        isCorrect: false
      },
      {
        id: 'opt-gamosa-3',
        titleAs: 'ফুলাম গামোচা',
        titleEn: 'Gamosa cloth',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr6u665tpmLQnz07FS1DcC1BfP_aZghar3sHq0Cvzw_1C5JIiXgQ9VfWKo4ZAAtOIbunm3SY4A0dX7mlFuqT9fBvhwC1_RusCLCiTZQcuwUGFDcOcoVabRCGQ06yZwqYIM8iddLUIJqusoGqVvUNd5oe0z_TzeFPxCwfH3xG6soXhZMzbif1_KElTSQgNsW-r4EJgSrlVRXjpD3Bkh7XnhcD1fIeF3UKqTHenDYy53Yj3LW4MPAC-zA',
        imageAlt: 'Gamosa cloth',
        isCorrect: true
      },
      {
        id: 'opt-cup-3',
        titleAs: 'কাঁহৰ বাটি',
        titleEn: 'Bell-metal cup',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYafon5qLDq4hKmGrAOkB8qngh3iqBf7536WvHvDY5tySgf8CMPkUDIpsb2nMWtYX1TJsYBPUgADPa8yvMVHIsrv7T5C669QEkmPHpHziGc5rlPRb3bgsLtQyqx8OoIi3SvnKK7ttDpEoLNRSwdoDcjElore36Pn1DYqAA4KX7f02fOtxaVztqYHCmphrSe_V7EeYLz78zDQ22X_gxI5qqcYG-1zvejblOc_KTXdnbrcDHvYyWXZVY7g',
        imageAlt: 'Bell-metal cup',
        isCorrect: false
      },
      {
        id: 'opt-fan-3',
        titleAs: 'বাঁহৰ বিচনী',
        titleEn: 'Bamboo hand fan',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNtGSCJeZ6VulYlpJM0tRfkC_RYUSbaeC0jv-epLl1KfBfuybFSv3OGecu5q9XaiV9jkYk7z28X-7xvy1XvCI_eK0HWy1onObRtBYGHaH0GrDhUqZjGwNOqGc6nZCIR4XVgOyn0XEUQKfQLtJPQguB05-6yG9xqaZPz_BguXBwEewHcqLuE2vgUvm67vvC_aB99ZOJelrdnkZReSrX1aDvwggc_9GAif_1pbW56BCNuEfxkjr1w0j3A',
        imageAlt: 'Bamboo fan',
        isCorrect: false
      }
    ],
    successMessageAs: 'অপূৰ্ব! ফুলাম গামোচাখন সঠিককৈ চিনাক্ত হʼল।',
    successMessageEn: 'Excellent! You matched the traditional Gamosa perfectly.',
    gentleGuidanceAs: 'চিন্তা নকৰিব, বগা কাপোৰৰ ৰঙা ফুলৰ পাৰিটো চাওঁক।',
    gentleGuidanceEn: 'Take your time, look for the white cloth with red floral borders.',
    hintAs: 'ইঙ্গিত: বগা আৰু ৰঙা ফুলৰ গামোচাখন বাছক।',
    hintEn: 'Hint: Select the woven white and red Gamosa textile.'
  }
];

export const ROUTINE_STEPS_TEA: RoutineStep[] = [
  {
    id: 'step-water',
    titleAs: '১. কেতলীত পানী উতলোৱা',
    titleEn: '1. Boil water in the kettle',
    descAs: 'মাটিৰ চৌকাত পানীখিনি জুৰাই গৰম কৰক',
    descEn: 'Heat the fresh water on the morning stove',
    icon: 'water_drop',
    correctPosition: 1
  },
  {
    id: 'step-leaves',
    titleAs: '২. চাহ পাত আৰু মচলা দিয়া',
    titleEn: '2. Add fresh tea leaves & ginger',
    descAs: 'উতলা পানীত সুগন্ধি চাহ পাত আৰু অলপ আদা দিয়ক',
    descEn: 'Add aromatic garden tea leaves and fresh crushed ginger',
    icon: 'spa',
    correctPosition: 2
  },
  {
    id: 'step-pour',
    titleAs: '৩. কাঁহৰ বাটিত বাকি দিয়া',
    titleEn: '3. Pour into bell-metal cup',
    descAs: 'সুস্বাদু গৰম চাহ কাঁহৰ বাটিত বাকি পৰিয়ালৰ লগত খাওক',
    descEn: 'Pour the warm tea into bell-metal cups to share peacefully',
    icon: 'local_cafe',
    correctPosition: 3
  }
];
