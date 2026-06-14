// Nama: Deni Trio Saputra
// NIM: 24110300009

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/*
|--------------------------------------------------------------------------
| 1a. GET /wallets
|--------------------------------------------------------------------------
| Mengambil seluruh wallet dan mengurutkannya berdasarkan createdAt terbaru.
*/

app.get("/wallets", async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(wallets);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 1b. POST /wallets
|--------------------------------------------------------------------------
| Membuat wallet baru.
*/

app.post("/wallets", async (req, res) => {
  try {
    const { name, currency } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        error: "name wajib diisi",
      });
    }

    const data = {
      name: name.trim(),
    };

    // Currency hanya dimasukkan jika diberikan.
    // Jika tidak ada, Prisma menggunakan default IDR.
    if (currency && currency.trim() !== "") {
      data.currency = currency.trim().toUpperCase();
    }

    const wallet = await prisma.wallet.create({
      data,
    });

    return res.status(201).json(wallet);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 1c. DELETE /wallets/:id
|--------------------------------------------------------------------------
| Menghapus seluruh transaksi wallet terlebih dahulu,
| kemudian menghapus wallet.
*/

app.delete("/wallets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: {
          walletId: id,
        },
      }),

      prisma.wallet.delete({
        where: {
          id,
        },
      }),
    ]);

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 2a. GET /wallets/:id/transactions
|--------------------------------------------------------------------------
| Mengambil transaksi berdasarkan walletId.
*/

app.get("/wallets/:id/transactions", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 2b. POST /wallets/:id/transactions
|--------------------------------------------------------------------------
| Menambahkan transaksi baru ke sebuah wallet.
*/

app.post("/wallets/:id/transactions", async (req, res) => {
  try {
    const walletId = Number(req.params.id);
    const { amount, type, category, date, note } = req.body;

    if (!Number.isInteger(walletId)) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletId,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    /*
     * Gunakan pengecekan null/undefined untuk amount.
     * Jangan memakai !amount karena nilai 0 perlu masuk
     * ke validasi "amount harus lebih dari 0".
     */
    const requiredFieldMissing =
      amount === undefined ||
      amount === null ||
      !type ||
      !category ||
      !date;

    if (requiredFieldMissing) {
      return res.status(400).json({
        error: "amount, type, category, dan date wajib diisi",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        error: 'type harus "income" atau "expense"',
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: "amount harus lebih dari 0",
      });
    }

    if (
      typeof category !== "string" ||
      category.trim() === "" ||
      Number.isNaN(new Date(date).getTime())
    ) {
      return res.status(400).json({
        error: "amount, type, category, dan date wajib diisi",
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: numericAmount,
        type,
        category: category.trim(),
        note:
          note === undefined || note === null || note === ""
            ? null
            : String(note),
        date: new Date(date),
        walletId,
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 2c. DELETE /transactions/:id
|--------------------------------------------------------------------------
| Versi bonus:
| mengembalikan data transaksi yang dihapus dan nama wallet asalnya.
*/

app.delete("/transactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({
        error: "Transaksi tidak ditemukan",
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        wallet: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        error: "Transaksi tidak ditemukan",
      });
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      deleted: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 3a. GET /wallets/:id/balance
|--------------------------------------------------------------------------
| Menghitung:
| balance = total income - total expense
*/

app.get("/wallets/:id/balance", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        id,
      },
      include: {
        transactions: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of wallet.transactions) {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      }

      if (transaction.type === "expense") {
        totalExpense += transaction.amount;
      }
    }

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      walletId: wallet.id,
      walletName: wallet.name,
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| 3b. GET /wallets/:id/summary
|--------------------------------------------------------------------------
| Mengelompokkan transaksi berdasarkan kategori.
*/

app.get("/wallets/:id/summary", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        id,
      },
      include: {
        transactions: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet tidak ditemukan",
      });
    }

    const groupedTransactions = {};

    for (const transaction of wallet.transactions) {
      const category = transaction.category;

      if (!groupedTransactions[category]) {
        groupedTransactions[category] = {
          category,
          count: 0,
          totalAmount: 0,
          types: {
            income: 0,
            expense: 0,
          },
        };
      }

      groupedTransactions[category].count += 1;
      groupedTransactions[category].totalAmount += transaction.amount;

      if (transaction.type === "income") {
        groupedTransactions[category].types.income += 1;
      }

      if (transaction.type === "expense") {
        groupedTransactions[category].types.expense += 1;
      }
    }

    const summary = Object.values(groupedTransactions).map((item) => {
      const avgAmount = Number(
        (item.totalAmount / item.count).toFixed(2)
      );

      return {
        category: item.category,
        count: item.count,
        totalAmount: item.totalAmount,
        avgAmount,
        types: item.types,
      };
    });

    return res.status(200).json({
      walletId: wallet.id,
      walletName: wallet.name,
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Menjalankan server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});