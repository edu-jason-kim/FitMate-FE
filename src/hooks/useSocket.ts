import { Socket, io } from "socket.io-client";
import { useEffect, useRef } from "react";

export const useSocket = () => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket.current) {
      console.log("소켓 생성 시도");
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;
      socket.current = io(`${SOCKET_URL}/socket.io/`, {
        transports: ["websocket"],
        reconnectionAttempts: 3,
        timeout: 5000,
        withCredentials: true,
      });

      const socketInstance = socket.current;

      socketInstance.on("connect", () => {
        console.log("🚀 소켓 연결 성공");
        console.log("소켓 ID:", socketInstance.id);
        console.log("연결 상태:", socketInstance.connected);

        socketInstance.emit("test", { message: "test" }, (response: any) => {
          console.log("테스트 이벤트 응답:", response);
        });
      });

      socketInstance.on("error", (error) => {
        console.error("🚨 소켓 에러:", error);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("연결 끊김:", reason);
      });

      const onevent = (socketInstance as any).onevent;
      (socketInstance as any).onevent = function (packet: any) {
        console.log("소켓 이벤트 발생:", packet);
        onevent.call(this, packet);
      };
    }

    return () => {
      if (socket.current?.connected) {
        socket.current.disconnect();
      }
    };
  }, []);

  return socket.current;
};
