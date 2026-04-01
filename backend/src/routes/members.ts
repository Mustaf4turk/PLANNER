import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Invite member to project by email
router.post('/invite', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, projectId, role } = req.body;

    if (!email || !projectId) {
      res.status(400).json({ error: 'E-posta ve proje ID gerekli' });
      return;
    }

    // Check project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: req.userId },
    });

    if (!project) {
      res.status(404).json({ error: 'Proje bulunamadı veya yetkiniz yok' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı' });
      return;
    }

    if (user.id === req.userId) {
      res.status(400).json({ error: 'Kendinizi davet edemezsiniz' });
      return;
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });

    if (existing) {
      res.status(400).json({ error: 'Kullanıcı zaten projede' });
      return;
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: role || 'member',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get members of a project
router.get('/project/:projectId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId);

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get all teammates (global team view)
router.get('/teammates', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all projects user is part of
    const userProjects = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map(p => p.projectId);

    // Get all members of those projects
    const teammates = await prisma.projectMember.findMany({
      where: {
        projectId: { in: projectIds },
        userId: { not: req.userId },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Deduplicate by user
    const uniqueTeammates = new Map<number, any>();
    for (const tm of teammates) {
      if (!uniqueTeammates.has(tm.user.id)) {
        uniqueTeammates.set(tm.user.id, {
          ...tm.user,
          projects: [{ id: tm.project.id, name: tm.project.name, role: tm.role }],
        });
      } else {
        uniqueTeammates.get(tm.user.id).projects.push({
          id: tm.project.id,
          name: tm.project.name,
          role: tm.role,
        });
      }
    }

    res.json(Array.from(uniqueTeammates.values()));
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Remove member from project
router.delete('/:memberId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memberId = parseInt(req.params.memberId);

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { project: true },
    });

    if (!member) {
      res.status(404).json({ error: 'Üye bulunamadı' });
      return;
    }

    if (member.project.ownerId !== req.userId) {
      res.status(403).json({ error: 'Sadece proje sahibi üye çıkarabilir' });
      return;
    }

    if (member.role === 'owner') {
      res.status(400).json({ error: 'Proje sahibi çıkarılamaz' });
      return;
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    res.json({ message: 'Üye projeden çıkarıldı' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
