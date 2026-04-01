# API Attendance

## LOGIN
POST /api/v1/auth/login
Body:
{
  "email": "sandi@gmail.com",
  "password": "200813"
}

## CHECK-IN
POST /api/v1/attendance/checkin
Headers:
Authorization: Bearer TOKEN
Form Data:
- photo (file)
- latitude
- longitude

## CHECK-OUT
POST /api/v1/attendance/checkout
Headers:
Authorization: Bearer TOKEN