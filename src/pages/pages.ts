/* Pages */
import { AddPage } from '../pages/add/add';
/* import { CreateWalletPage } from '../pages/add/create-wallet/create-wallet';*/
/* import { ImportWalletPage } from '../pages/add/import-wallet/import-wallet';*/
import { JoinWalletPage } from '../pages/add/join-wallet/join-wallet';
import { BackupGamePage } from '../pages/backup/backup-game/backup-game';
import { BackupWarningPage } from '../pages/backup/backup-warning/backup-warning';
import { FeedbackCompletePage } from '../pages/feedback/feedback-complete/feedback-complete';
import { FeedbackPage } from '../pages/feedback/feedback/feedback';
import { SendFeedbackPage } from '../pages/feedback/send-feedback/send-feedback';
import { FinishModalPage } from '../pages/finish/finish';
import { BackupRequestPage } from '../pages/onboarding/backup-request/backup-request';
import { CollectEmailPage } from '../pages/onboarding/collect-email/collect-email';
import { DisclaimerPage } from '../pages/onboarding/disclaimer/disclaimer';
import { OnboardingPage } from '../pages/onboarding/onboarding';
import { TourPage } from '../pages/onboarding/tour/tour';
import { PaperWalletPage } from '../pages/paper-wallet/paper-wallet';
import { PayProPage } from '../pages/paypro/paypro';
import { SlideToAcceptPage } from '../pages/slide-to-accept/slide-to-accept';
import { TabsPage } from '../pages/tabs/tabs';
import { TxDetailsPage } from '../pages/tx-details/tx-details';
import { TxpDetailsPage } from '../pages/txp-details/txp-details';
import { SearchTxModalPage } from '../pages/wallet-details/search-tx-modal/search-tx-modal';
import { WalletBalancePage } from '../pages/wallet-details/wallet-balance/wallet-balance';
import { WalletDetailsPage } from '../pages/wallet-details/wallet-details';
import { WelcomePage } from '../pages/welcome/welcome';

/*Includes */
import { CardItemPage } from '../pages/includes/card-item/card-item';
import { FeedbackCardPage } from '../pages/includes/feedback-card/feedback-card';
import { GravatarPage } from '../pages/includes/gravatar/gravatar';
import { IncomingDataMenuPage } from '../pages/includes/incoming-data-menu/incoming-data-menu';
import { TxpPage } from '../pages/includes/txp/txp';
import { WalletActivityPage } from '../pages/includes/wallet-activity/wallet-activity';
import { WalletItemPage } from '../pages/includes/wallet-item/wallet-item';
import { WalletSelectorPage } from '../pages/includes/wallet-selector/wallet-selector';

/* Tabs */
import { GoldMarketPage } from '../pages/goldmarket/goldmarket';
import { HomePage } from '../pages/home/home';
import { PropMarketPage } from '../pages/propmarket/propmarket';
import { SettingsPage } from '../pages/settings/settings';

/* Home */
import { ActivityPage } from '../pages/home/activity/activity';
import { GameDetailPage } from '../pages/home/game-detail/game-detail';
import { GameDiscussPage } from '../pages/home/game-discuss/game-discuss';
import { ProposalsPage } from '../pages/home/proposals/proposals';
import { ReceivePage } from '../pages/receive/receive';
import { ScanPage } from '../pages/scan/scan';
import { SendPage } from '../pages/send/send';

/* Settings */
import { FingerprintModalPage } from '../pages/fingerprint/fingerprint';
import { PIN_COMPONENTS } from '../pages/pin/pin';
import { AboutPage } from '../pages/settings/about/about';
import { SessionLogPage } from '../pages/settings/about/session-log/session-log';
import { AddressbookAddPage } from '../pages/settings/addressbook/add/add';
import { AddressbookPage } from '../pages/settings/addressbook/addressbook';
import { AddressbookViewPage } from '../pages/settings/addressbook/view/view';
import { AdvancedPage } from '../pages/settings/advanced/advanced';
import { AltCurrencyPage } from '../pages/settings/alt-currency/alt-currency';
import { FeePolicyPage } from '../pages/settings/fee-policy/fee-policy';
import { LanguagePage } from '../pages/settings/language/language';
// import { LockPage } from '../pages/settings/lock/lock';
import { NotificationsPage } from '../pages/settings/notifications/notifications';

/* Mine */
import { CreateWalletPage } from '../pages/mine/createwallet/createwallet';
import { ImportWalletPage } from '../pages/mine/importwallet/importwallet';
import { MinePage } from '../pages/mine/mine';
import { MyGamePage } from '../pages/mine/mygame/mygame';
import { AllPropsPage } from '../pages/mine/myprops/allprops/allprops';
import { MyPropsPage } from '../pages/mine/myprops/myprops';
import { PropsBillPage } from '../pages/mine/myprops/propsbill/propsbill';
import { PropsDetailsPage } from '../pages/mine/myprops/propsdetails/propsdetails';
import { SalePropsPage } from '../pages/mine/myprops/saleprops/saleprops';
import { BackupWalletPage } from '../pages/mine/mywallet/backupwallet/backupwallet';
import { BillingDetailsPage } from '../pages/mine/mywallet/billingdetails/billingdetails';
import { MyWalletPage } from '../pages/mine/mywallet/mywallet';
import { PaymentDetailsPage } from '../pages/mine/mywallet/paymentdetails/paymentdetails';
import { SetPasswordPage } from '../pages/mine/setpassword/setpassword';
import { PoundagePage } from '../pages/settings/poundage/poundage';
import { LoginPage } from '../pages/mine/login/login';

/* Wallet Settings */
import { WalletColorPage } from '../pages/settings/wallet-settings/wallet-color/wallet-color';
import { WalletNamePage } from '../pages/settings/wallet-settings/wallet-name/wallet-name';
import { WalletSettingsPage } from '../pages/settings/wallet-settings/wallet-settings';

/* Wallet Advanced Settings */
import { BitcoinCashPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/bitcoin-cash/bitcoin-cash';
import { AllAddressesPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-addresses/all-addresses/all-addresses';
import { WalletAddressesPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-addresses/wallet-addresses';
import { WalletDeletePage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-delete/wallet-delete';
import { WalletExportPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-export/wallet-export';
import { WalletExtendedPrivateKeyPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-information/wallet-extended-private-key/wallet-extended-private-key';
import { WalletInformationPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-information/wallet-information';
import { WalletServiceUrlPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-service-url/wallet-service-url';
import { WalletSettingsAdvancedPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-settings-advanced';
import { WalletTransactionHistoryPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-transaction-history/wallet-transaction-history';

/* Send */
import { AmountPage } from '../pages/send/amount/amount';
import { ChooseFeeLevelPage } from '../pages/send/choose-fee-level/choose-fee-level';
import { ConfirmPage } from '../pages/send/confirm/confirm';
import { ConFirmResultPage } from '../pages/send/confirmresult/confirmresult';
import { ConfirmSendPage } from '../pages/send/confirmsend/confirmsend';

/* Receive */
import { CustomAmountPage } from '../pages/receive/custom-amount/custom-amount';

/* PropMarket */
import { PropDetailPage } from '../pages/propmarket/prop-detail/prop-detail';
import { PropReleasePage } from '../pages/propmarket/propsrelease/proprelease';

/* game */
import { BuysuccessPage } from '../pages/goldmarket/buysuccess/buysuccess';
import { MarketListPage } from '../pages/goldmarket/market-list/market-list';
import { SalePage } from '../pages/goldmarket/sale/sale';
import { SellingDetailsPage } from '../pages/goldmarket/sellingdetails/sellingdetails';

export const PAGES = [
  WelcomePage,
  ActivityPage,
  AddPage,
  AmountPage,
  AddressbookPage,
  AddressbookAddPage,
  AddressbookViewPage,
  AboutPage,
  AdvancedPage,
  AllAddressesPage,
  AltCurrencyPage,
  BackupRequestPage,
  BitcoinCashPage,

  ChooseFeeLevelPage,
  CreateWalletPage,

  FeedbackCardPage,
  FeedbackPage,
  FeedbackCompletePage,
  IncomingDataMenuPage,
  JoinWalletPage,
  BackupWarningPage,
  BackupGamePage,
  ConfirmPage,
  ConfirmSendPage,
  ConFirmResultPage,
  CustomAmountPage,
  DisclaimerPage,
  CollectEmailPage,
  GravatarPage,
  FingerprintModalPage,
  MinePage,
  SetPasswordPage,
  PoundagePage,
  MyGamePage,
  MyPropsPage,
  PropsBillPage,
  PropsDetailsPage,
  AllPropsPage,
  SalePropsPage,
  PaymentDetailsPage,
  BillingDetailsPage,
  ImportWalletPage,
  BackupWalletPage,
  MyWalletPage,
  HomePage,
  LanguagePage,
  OnboardingPage,
  PaperWalletPage,
  PayProPage,
  GameDetailPage,
  ...PIN_COMPONENTS,
  ProposalsPage,
  MarketListPage,
  SellingDetailsPage,
  SalePage,
  BuysuccessPage,
  GoldMarketPage,
  PropMarketPage,
  PropDetailPage,
  PropReleasePage,
  SettingsPage,
  NotificationsPage,
  FeePolicyPage,
  SearchTxModalPage,
  SessionLogPage,
  SendFeedbackPage,
  FinishModalPage,
  TourPage,
  TabsPage,
  ReceivePage,
  ScanPage,
  SendPage,
  TxpDetailsPage,
  TxDetailsPage,
  TxpPage,
  WalletSettingsPage,
  WalletSettingsAdvancedPage,
  WalletNamePage,
  WalletColorPage,
  WalletInformationPage,
  WalletAddressesPage,
  WalletExportPage,
  WalletServiceUrlPage,
  WalletTransactionHistoryPage,
  WalletDeletePage,
  WalletExtendedPrivateKeyPage,
  WalletDetailsPage,
  WalletBalancePage,
  WalletItemPage,
  WalletActivityPage,
  WalletSelectorPage,
  CardItemPage,
  SlideToAcceptPage,
  GameDiscussPage,
  LoginPage
];
