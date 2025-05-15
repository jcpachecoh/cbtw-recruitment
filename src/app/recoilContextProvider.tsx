"use client";

import { RecoilRoot, atom } from "recoil";

export const onlineUserState = atom({
  key: "user",
  default: {
     id: '',
    email: '',
    userName: '',
    userType: '',
    userStatus: ''
  },
});

export default function RecoidContextProvider({ children }: { children: React.ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}