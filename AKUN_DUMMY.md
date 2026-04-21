# Akun Dummy SDP-V2

Database telah direset dan dikonfigurasi dengan akun dummy berikut:

## Admin Account
| Email | Password | Role | Notes |
|-------|----------|------|-------|
| admin@starinc.id | password123 | Admin | Akun admin utama |

## Starcenter Accounts (Regional)

### SC Jawa Timur
| Email | Password | Role | Referral Code | Tier | Notes |
|-------|----------|------|----------------|------|-------|
| sc.jawatimur@starinc.com | password123 | Starcenter | SCJT001 | Diamond | SC Regional Jawa Timur |

**Downlines SC Jawa Timur:**
- Email: downline.1.1@starinc.com | Password: password123 | Role: Regular
- Email: downline.1.2@starinc.com | Password: password123 | Role: Regular
- Email: downline.1.3@starinc.com | Password: password123 | Role: Regular

---

### SC Jawa Tengah
| Email | Password | Role | Referral Code | Tier | Notes |
|-------|----------|------|----------------|------|-------|
| sc.jawatengah@starinc.com | password123 | Starcenter | SCJG001 | Diamond | SC Regional Jawa Tengah |

**Downlines SC Jawa Tengah:**
- Email: downline.2.1@starinc.com | Password: password123 | Role: Regular
- Email: downline.2.2@starinc.com | Password: password123 | Role: Regular
- Email: downline.2.3@starinc.com | Password: password123 | Role: Regular

---

### SC Jawa Barat
| Email | Password | Role | Referral Code | Tier | Notes |
|-------|----------|------|----------------|------|-------|
| sc.jawabarat@starinc.com | password123 | Starcenter | SCJB001 | Diamond | SC Regional Jawa Barat |

**Downlines SC Jawa Barat:**
- Email: downline.3.1@starinc.com | Password: password123 | Role: Regular
- Email: downline.3.2@starinc.com | Password: password123 | Role: Regular
- Email: downline.3.3@starinc.com | Password: password123 | Role: Regular

---

## Data Transaksi (Transactions)

Setiap akun downline memiliki transaksi dengan status berbeda:

### Status Transaksi:
- **pending_payment** - Menunggu verifikasi pembayaran
- **processing** - Sedang diproses
- **shipped** - Telah dikirim
- **completed** - Selesai
- **rejected** - Ditolak

### Distribusi Transaksi:
- 70% transaksi dengan status **completed**
- 15% transaksi dengan status **processing** atau **shipped**
- 10% transaksi dengan status **pending_payment**
- 5% transaksi dengan status **rejected**

Total: ±120 transaksi tersebar di semua akun.

---

## Akses ke Admin Panel

1. Buka URL: `http://localhost:8000/admin`
2. Login dengan:
   - Email: `admin@starinc.id`
   - Password: `password123`

Dari admin panel, Anda dapat:
- Melihat semua user dan network mereka
- Melihat transaksi dengan berbagai status
- Melihat komisi yang didistribusikan
- Edit user roles, tiers, dan passwords

---

## Testing Tips

### View Network Structure
```bash
http://localhost:8000/admin/users/{id}/network
```
Ganti `{id}` dengan ID dari SC user untuk melihat struktur downline.

### View User Transactions
```bash
http://localhost:8000/admin/users/{id}/orders
```
Ganti `{id}` dengan ID dari user untuk melihat semua transaksinya.

### View User Commissions
```bash
http://localhost:8000/admin/users/{id}/commissions
```
Ganti `{id}` dengan ID dari user untuk melihat komisi yang diterima.

---

## Notes

- **Password**: Semua akun menggunakan password `password123`
- **Database**: SQLite (auto-reset saat menjalankan `php artisan migrate:fresh --seed`)
- **API Base URL**: `http://localhost:8000/api`
- **Frontend Base URL**: `http://localhost:3000` (Vite dev server)

Untuk reset database dan data kembali ke initial state:
```bash
cd starinc-api
php artisan migrate:fresh --seed
```
