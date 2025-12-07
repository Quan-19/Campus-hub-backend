export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    user_id: number;
    email: string;
    name: string;
    role: {
      role_id: number;
      name: string;
    };
  };
}
