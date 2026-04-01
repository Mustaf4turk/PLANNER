import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get tasks for a project
router.get('/project/:projectId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get all tasks for user (across all projects)
router.get('/all', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Create task
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, startDate, dueDate, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      res.status(400).json({ error: 'Başlık ve proje ID gerekli' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority, startDate, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Görev bulunamadı' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Update task status (quick status change for Kanban)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
      res.status(400).json({ error: 'Geçersiz durum' });
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Görev bulunamadı' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Görev bulunamadı' });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Görev silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
