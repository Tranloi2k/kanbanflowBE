# Migration từ Raw SQL sang Prisma với Supabase

## 🔄 Các bước migration

### 1. Cập nhật .env với thông tin Supabase

```env
# Prisma Database URL for Supabase
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

### 2. Push schema lên Supabase database

```bash
npx prisma db push
```

### 3. Seed dữ liệu mẫu

```bash
npm run db:seed
```

### 4. Mở Prisma Studio để xem dữ liệu

```bash
npm run db:studio
```

## 🆚 So sánh Raw SQL vs Prisma

### Raw SQL (Trước)

```javascript
const query = `
  INSERT INTO users (name, email, password, role)
  VALUES ($1, $2, $3, $4)
  RETURNING id, name, email, role
`;
const result = await db.query(query, [name, email, hashedPassword, "user"]);
const user = result.rows[0];
```

### Prisma (Sau)

```javascript
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: "USER",
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
});
```

## ✅ Lợi ích của Prisma

1. **Type Safety**: TypeScript support out of the box
2. **Auto-completion**: IntelliSense cho queries
3. **Migration System**: Quản lý schema changes
4. **Query Builder**: Syntax đơn giản hơn SQL
5. **Relationship Handling**: Dễ dàng làm việc với relations
6. **Database Agnostic**: Có thể chuyển database dễ dàng

## 📝 Các commands hữu ích

```bash
# Generate Prisma Client sau khi thay đổi schema
npx prisma generate

# Push schema changes lên database (development)
npx prisma db push

# Tạo migration file (production)
npx prisma migrate dev --name your-migration-name

# Reset database và seed lại
npx prisma migrate reset

# Mở Prisma Studio
npx prisma studio

# Format schema file
npx prisma format
```

## 🔗 Relations trong Prisma

Prisma tự động xử lý foreign keys và relationships:

```javascript
// Lấy user với tất cả boards
const userWithBoards = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    ownedBoards: true,
    boardMembers: {
      include: {
        board: true,
      },
    },
  },
});

// Tạo board với members
const board = await prisma.board.create({
  data: {
    title: "New Board",
    owner: {
      connect: { id: userId },
    },
    members: {
      create: [
        {
          user: { connect: { id: memberId } },
          role: "MEMBER",
        },
      ],
    },
  },
});
```
