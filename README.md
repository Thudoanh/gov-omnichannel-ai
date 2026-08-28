# Gov Omnichannel AI

Hệ thống prototype điều hành đa kênh dành cho cơ quan nhà nước. Frontend React gọi REST API Express; backend sử dụng Prisma ORM và PostgreSQL làm nguồn dữ liệu nghiệp vụ chính.

## Kiến trúc

```text
React frontend
    ↓
Typed API clients (src/services)
    ↓
Express routes + validation + RBAC
    ↓
Service layer
    ↓
Repository contract
    ↓
Prisma repositories
    ↓
PostgreSQL
```

- `src/components/`: giao diện React 19 hiện có.
- `src/services/`: API client tập trung; component không gọi trực tiếp `fetch`.
- `server/src/routes/`: REST route và ranh giới RBAC.
- `server/src/controllers/`: controller dùng chung cho repository contract.
- `server/src/services/`: ticket, analytics và transaction nghiệp vụ.
- `server/src/repositories/`: Prisma repository và mapper domain.
- `server/src/middleware/`: database-backed session, authentication, authorization, CORS và logging.
- `server/prisma/schema.prisma`: schema PostgreSQL.
- `server/prisma/migrations/`: migration SQL có version.
- `server/prisma/seed.ts`: seed dữ liệu development từ dataset prototype.
- `server/scripts/verify.ts`: kiểm tra persistence, security và transaction.

Prisma type không được trả trực tiếp qua API. Mapper chuyển database record về domain contract hiện có để frontend không phụ thuộc ORM.

## Yêu cầu

- Node.js 20 trở lên
- npm
- PostgreSQL 15 trở lên

## Cài đặt

```bash
npm install
npm --prefix server install
```

Tạo `server/.env` từ `server/.env.example` và cấu hình PostgreSQL:

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/gov_omnichannel_ai?schema=public"
```

Không commit `server/.env` hoặc thông tin đăng nhập thật.

## Khởi tạo cơ sở dữ liệu

Generate Prisma Client:

```bash
npm --prefix server run db:generate
```

Tạo migration mới trong development:

```bash
npm --prefix server run db:migrate -- --name ten_migration
```

Áp dụng migration đã có trong production:

```bash
npm --prefix server run db:migrate:deploy
```

Seed dữ liệu development:

```bash
npm --prefix server run db:seed
```

Mở Prisma Studio khi cần kiểm tra dữ liệu:

```bash
npm --prefix server run db:studio
```

Không dùng `prisma db push` làm chiến lược migration chính.

## Chạy ứng dụng

Backend:

```bash
npm run dev:server
```

Frontend, trong terminal khác:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- API base URL: `http://localhost:3001/api/v1`
- Health check: `GET http://localhost:3001/api/health`

Health check thành công:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Build và kiểm tra

```bash
npm run lint
npm run build
npm --prefix server run typecheck
npm run build:server
npm --prefix server run verify
```

`verify` sử dụng database được cấu hình trong `DATABASE_URL`, tạo dữ liệu có prefix verification và cleanup sau khi chạy. Không chạy script này trên production database.

Script kiểm tra:

- Kết nối PostgreSQL qua health check.
- Public registration không thể tự gán `admin`.
- Self-profile update không thể thay đổi role.
- Mutation trái quyền trả `403`.
- Admin có thể quản lý role qua privileged flow.
- User, Ticket, Message, InternalNote, FAQ và Campaign tồn tại sau khi HTTP server restart.
- Broadcast reply → ticket commit nguyên tử khi thành công.
- Broadcast reply rollback khi ticket creation thất bại.

## Mô hình dữ liệu

- `User`, `Session`
- `Ticket`, `Message`, `InternalNote`, `TicketAIAnalysis`
- `FAQ`, `CannedSnippet`
- `AfterHoursRule`, `AfterHoursLog`, `ScheduledCallback`
- `Campaign`, `BroadcastReply`

Ticket assignee và note author dùng `ON DELETE SET NULL` để giữ lịch sử khi user bị xóa. Message, note và AI analysis dùng cascade theo ticket. Campaign không thể bị xóa khi vẫn còn broadcast reply tham chiếu.

## API

Tất cả endpoint dưới `/api/v1` dùng response envelope hiện tại. Danh sách có thêm `meta.total`; lỗi có `error.code` và `error.message`.

| Nhóm | Endpoint |
| --- | --- |
| Xác thực | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Người dùng | `GET/POST /users`, `GET/PUT/DELETE /users/:id` |
| Hồ sơ | `GET/POST /tickets`, `GET/PUT/DELETE /tickets/:id` |
| Thao tác hồ sơ | `POST /tickets/:id/messages`, `POST /tickets/:id/notes`, `PATCH /tickets/:id/status`, `PATCH /tickets/:id/assignee` |
| Ngoài giờ | Rules, logs và callbacks dưới `/after-hours/*` và `/callbacks` |
| Kho tri thức | CRUD `/faqs` và `/snippets` |
| Phát sóng | CRUD `/campaigns`, status và `/broadcast-replies` |
| Routing nguyên tử | `POST /broadcast-replies/:id/route-to-ticket` |
| Phân tích | `GET /analytics/overview` |

Ticket filter được thực thi trong PostgreSQL: `channel`, `status`, `urgency`, `category` và `search`.

## Security hiện tại

- Session token ngẫu nhiên, chỉ lưu SHA-256 hash trong PostgreSQL và hết hạn sau 12 giờ.
- Public registration luôn gán role `officer`; role từ client bị bỏ qua.
- Self-update dùng whitelist và cấm `role`, `status`, `id`, `passwordHash` cùng các field đặc quyền.
- Admin update role đi qua privileged flow có RBAC.
- Ticket full update, after-hours mutation và broadcast reply mutation có authorization server-side.
- Repository map field rõ ràng, không truyền trực tiếp `req.body` vào Prisma.
- Prisma error được map thành HTTP `404`, `409`, `500` hoặc `503`; raw database error không trả về client.
- `passwordHash` không nằm trong domain mapper/API response. Prototype hiện chưa thực hiện password authentication nên không lưu plaintext password.

## Transaction

- Ticket creation ghi Ticket, Message, InternalNote và AIAnalysis nguyên tử.
- Add message cập nhật conversation và ticket summary trong transaction.
- Add note và ticket timestamp dùng transaction.
- Scheduled callback được tạo cùng after-hours log.
- Broadcast reply → ticket dùng interactive `prisma.$transaction`; mọi bước rollback nếu ticket creation lỗi.

## Các phần vẫn đang mô phỏng

- Password login, VNeID, OTP, QR và forgot-password production flow.
- Gemini và AI/NLP backend; `MockAIService` chưa được route sử dụng.
- Zalo, Facebook, SMS, email, DVC và Hotline provider.
- Notifications, sound settings, after-hours mode và UI-only state vẫn nằm ở frontend.
- Frontend vẫn giữ `INITIAL_*` làm loading/fallback; khi API thành công, dữ liệu PostgreSQL ghi đè fallback.
- Analytics endpoint query PostgreSQL thật, nhưng UI hiện vẫn tính metric từ các dataset API đã tải và chưa sử dụng trực tiếp analytics response.

## Technical debt chưa xử lý trong phase này

- Domain types vẫn bị khai báo riêng ở frontend/backend.
- `App.tsx`, `AuthModal.tsx` và `OmnichannelInbox.tsx` vẫn là component lớn.
- Chưa có production password/JWT/VNeID authentication.
- Chưa có integration provider thật cho các kênh.
- Verification hiện là API integration script; phase tiếp theo nên bổ sung test runner, isolated test database và coverage tự động.
