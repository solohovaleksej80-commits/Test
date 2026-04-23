export type Locale = 'ru' | 'en'

type Dict = Record<string, string>

const ru: Dict = {
  'app.name': 'Verra',
  'app.tagline': 'тёплый браузерный кошелёк',

  'welcome.hero.line1': 'Кошелёк,',
  'welcome.hero.line2': 'который дышит.',
  'welcome.sub':
    'Браузерный мульти‑чейн кошелёк. Ваши ключи шифруются локально паролем и никогда не покидают устройство.',
  'welcome.create': 'Создать кошелёк',
  'welcome.import': 'Импортировать фразу',
  'welcome.security.local': 'AES‑GCM + PBKDF2',
  'welcome.security.chains': '6 EVM‑сетей',
  'welcome.security.open': 'Без регистрации',

  'create.title': 'Новая seed‑фраза',
  'create.desc':
    'Это 12 слов, которые полностью контролируют кошелёк. Запишите их в безопасном месте. Никогда и никому не передавайте.',
  'create.reveal': 'Показать фразу',
  'create.hide': 'Скрыть',
  'create.copy': 'Скопировать',
  'create.copied': 'Скопировано',
  'create.confirm': 'Я записал(а) фразу',
  'create.password.title': 'Придумайте пароль',
  'create.password.desc':
    'Паролем шифруется ваша seed‑фраза в этом браузере. Пароль нельзя восстановить.',
  'create.password.placeholder': 'Пароль (минимум 8 символов)',
  'create.password.confirm': 'Повторите пароль',
  'create.password.mismatch': 'Пароли не совпадают',
  'create.password.short': 'Минимум 8 символов',
  'create.finish': 'Готово',

  'import.title': 'Импорт кошелька',
  'import.desc':
    'Вставьте свою seed‑фразу из 12 или 24 слов. Она будет зашифрована и сохранена только в этом браузере.',
  'import.placeholder': 'слово1 слово2 слово3 …',
  'import.invalid': 'Фраза некорректна',
  'import.continue': 'Продолжить',

  'unlock.title': 'С возвращением',
  'unlock.desc': 'Введите пароль, чтобы открыть кошелёк.',
  'unlock.placeholder': 'Пароль',
  'unlock.button': 'Открыть',
  'unlock.forgot': 'Забыли пароль? Сбросить кошелёк',
  'unlock.wrong': 'Неверный пароль',

  'nav.home': 'Портфель',
  'nav.swap': 'Своп',
  'nav.nft': 'NFT',
  'nav.history': 'История',
  'nav.discover': 'DApp',
  'nav.settings': 'Настройки',

  'home.total': 'Баланс портфеля',
  'home.hide': 'скрыть',
  'home.show': 'показать',
  'home.send': 'Отправить',
  'home.receive': 'Получить',
  'home.swap': 'Обмен',
  'home.buy': 'Купить',
  'home.assets': 'Активы',
  'home.allocation': 'Распределение',
  'home.empty': 'Пока здесь пусто. Получите первый актив.',

  'send.title': 'Отправить',
  'send.to': 'Получатель',
  'send.to.placeholder': '0x… или имя из контактов',
  'send.amount': 'Сумма',
  'send.max': 'MAX',
  'send.review': 'Проверить',
  'send.confirm': 'Подтвердить и отправить',
  'send.fee': 'Сетевой сбор',
  'send.success': 'Транзакция отправлена',
  'send.invalidAddr': 'Некорректный адрес',
  'send.invalidAmount': 'Некорректная сумма',
  'send.insufficient': 'Недостаточно средств',

  'receive.title': 'Получить',
  'receive.sub': 'Покажите QR‑код или скопируйте адрес.',
  'receive.copy': 'Скопировать адрес',
  'receive.copied': 'Адрес скопирован',

  'swap.title': 'Обмен',
  'swap.from': 'Отдаёте',
  'swap.to': 'Получаете',
  'swap.rate': 'Курс',
  'swap.provider': 'через 1inch',
  'swap.comingSoon': 'Оценка через 1inch / 0x',
  'swap.notImplemented':
    'В этой сборке свап оценивается off‑chain; реальное исполнение требует API‑ключа агрегатора.',

  'nft.title': 'Коллекция',
  'nft.empty':
    'NFT не найдены. В базовой сборке каталог NFT открывается через внешние браузеры. Добавьте коллекцию по адресу контракта.',

  'history.title': 'История',
  'history.empty': 'Транзакции появятся здесь после первого перевода.',

  'discover.title': 'DApp',
  'discover.sub':
    'Откройте популярные приложения прямо в браузере. Подключение через injected‑провайдер Verra.',

  'settings.title': 'Настройки',
  'settings.networks': 'Сети',
  'settings.currency': 'Валюта',
  'settings.language': 'Язык',
  'settings.security': 'Безопасность',
  'settings.reveal': 'Показать seed‑фразу',
  'settings.changePwd': 'Сменить пароль',
  'settings.reset': 'Сбросить кошелёк',
  'settings.resetDesc':
    'Локальные данные будут удалены. Без seed‑фразы восстановить кошелёк невозможно.',
  'settings.about': 'О приложении',
  'settings.aboutText':
    'Verra — демонстрационный браузерный кошелёк. Не использует серверов, все ключи остаются у вас.',

  'asset.send': 'Отправить',
  'asset.receive': 'Получить',
  'asset.swap': 'Обменять',
  'asset.about': 'Об активе',

  common: 'Общий',
  cancel: 'Отмена',
  back: 'Назад',
  copy: 'Копировать',
  copied: 'Скопировано',
  next: 'Далее',
  done: 'Готово',
  address: 'Адрес',
  network: 'Сеть',
  locked: 'Заблокировано',
}

const en: Dict = {
  'app.name': 'Verra',
  'app.tagline': 'a warm browser wallet',

  'welcome.hero.line1': 'A wallet',
  'welcome.hero.line2': 'that breathes.',
  'welcome.sub':
    'Browser-first multi-chain wallet. Your keys are encrypted locally by your password and never leave this device.',
  'welcome.create': 'Create wallet',
  'welcome.import': 'Import phrase',
  'welcome.security.local': 'AES-GCM + PBKDF2',
  'welcome.security.chains': '6 EVM chains',
  'welcome.security.open': 'No sign-up',

  'create.title': 'New recovery phrase',
  'create.desc':
    'These 12 words fully control the wallet. Write them down somewhere safe. Never share them.',
  'create.reveal': 'Reveal phrase',
  'create.hide': 'Hide',
  'create.copy': 'Copy',
  'create.copied': 'Copied',
  'create.confirm': "I've written it down",
  'create.password.title': 'Pick a password',
  'create.password.desc':
    'Your password encrypts the seed phrase in this browser. The password can’t be recovered.',
  'create.password.placeholder': 'Password (at least 8 characters)',
  'create.password.confirm': 'Repeat password',
  'create.password.mismatch': "Passwords don't match",
  'create.password.short': 'At least 8 characters',
  'create.finish': 'Finish',

  'import.title': 'Import wallet',
  'import.desc':
    'Paste your 12- or 24-word recovery phrase. It will be encrypted and stored in this browser only.',
  'import.placeholder': 'word1 word2 word3 …',
  'import.invalid': 'Phrase is not valid',
  'import.continue': 'Continue',

  'unlock.title': 'Welcome back',
  'unlock.desc': 'Enter your password to open the wallet.',
  'unlock.placeholder': 'Password',
  'unlock.button': 'Unlock',
  'unlock.forgot': 'Forgot password? Reset wallet',
  'unlock.wrong': 'Incorrect password',

  'nav.home': 'Portfolio',
  'nav.swap': 'Swap',
  'nav.nft': 'NFT',
  'nav.history': 'History',
  'nav.discover': 'DApps',
  'nav.settings': 'Settings',

  'home.total': 'Portfolio balance',
  'home.hide': 'hide',
  'home.show': 'show',
  'home.send': 'Send',
  'home.receive': 'Receive',
  'home.swap': 'Swap',
  'home.buy': 'Buy',
  'home.assets': 'Assets',
  'home.allocation': 'Allocation',
  'home.empty': 'Nothing here yet. Receive your first asset.',

  'send.title': 'Send',
  'send.to': 'Recipient',
  'send.to.placeholder': '0x… or saved contact',
  'send.amount': 'Amount',
  'send.max': 'MAX',
  'send.review': 'Review',
  'send.confirm': 'Confirm and send',
  'send.fee': 'Network fee',
  'send.success': 'Transaction broadcast',
  'send.invalidAddr': 'Invalid address',
  'send.invalidAmount': 'Invalid amount',
  'send.insufficient': 'Insufficient balance',

  'receive.title': 'Receive',
  'receive.sub': 'Show the QR or copy the address.',
  'receive.copy': 'Copy address',
  'receive.copied': 'Address copied',

  'swap.title': 'Swap',
  'swap.from': 'From',
  'swap.to': 'To',
  'swap.rate': 'Rate',
  'swap.provider': 'via 1inch',
  'swap.comingSoon': '1inch / 0x quotes',
  'swap.notImplemented':
    'In this build swaps are quoted off-chain; executing them requires an aggregator API key.',

  'nft.title': 'Collection',
  'nft.empty':
    'No NFTs yet. In this build the catalog opens via external explorers. Add a collection by contract address.',

  'history.title': 'History',
  'history.empty': 'Transactions will show up here after your first transfer.',

  'discover.title': 'DApps',
  'discover.sub':
    'Open popular apps right from the browser. They connect via Verra’s injected provider.',

  'settings.title': 'Settings',
  'settings.networks': 'Networks',
  'settings.currency': 'Currency',
  'settings.language': 'Language',
  'settings.security': 'Security',
  'settings.reveal': 'Reveal recovery phrase',
  'settings.changePwd': 'Change password',
  'settings.reset': 'Reset wallet',
  'settings.resetDesc': 'Local data will be erased. Without the recovery phrase there is no way back.',
  'settings.about': 'About',
  'settings.aboutText':
    'Verra is a demo browser wallet. No servers, your keys stay with you.',

  'asset.send': 'Send',
  'asset.receive': 'Receive',
  'asset.swap': 'Swap',
  'asset.about': 'About',

  common: 'Total',
  cancel: 'Cancel',
  back: 'Back',
  copy: 'Copy',
  copied: 'Copied',
  next: 'Next',
  done: 'Done',
  address: 'Address',
  network: 'Network',
  locked: 'Locked',
}

const DICTS: Record<Locale, Dict> = { ru, en }

export function t(key: string, locale: Locale = 'ru'): string {
  return DICTS[locale][key] ?? DICTS.en[key] ?? key
}
