import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all projects for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get single project
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Create project
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, logo } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Proje adı gerekli' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        logo: logo || null,
        ownerId: req.userId!,
        members: {
          create: { userId: req.userId!, role: 'owner' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);
    const { name, description, logo } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: req.userId },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı veya yetkiniz yok' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name, description, ...(logo !== undefined && { logo: logo || null }) },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: req.userId },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı veya yetkiniz yok' });
      return;
    }

    await prisma.project.delete({ where: { id: projectId } });
    res.json({ message: 'Proje silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.count({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
    });

    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      },
      _count: true,
    });

    const stats = {
      totalProjects: projects,
      todoTasks: tasks.find(t => t.status === 'todo')?._count || 0,
      inProgressTasks: tasks.find(t => t.status === 'in-progress')?._count || 0,
      doneTasks: tasks.find(t => t.status === 'done')?._count || 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
