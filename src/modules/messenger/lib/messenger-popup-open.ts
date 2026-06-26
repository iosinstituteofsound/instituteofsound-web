import {
  dispatchOpenMessenger,
  useMessengerPopupStore,
  type MessengerOpenDetail,
} from '@/modules/messenger/store/messenger-popup-store'

export async function openMessengerPopup(detail: MessengerOpenDetail) {
  await useMessengerPopupStore.getState().openChat(detail)
}

export function requestMessengerPopup(detail: MessengerOpenDetail) {
  dispatchOpenMessenger(detail)
}
