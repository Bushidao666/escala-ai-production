import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCreativeRequestUseCase } from './create-creative-request.usecase';
import { CreativeRepository } from '../../infra/supabase-creative.repository';
import { CreateCreativeRequestData } from '../../dto/creative.schema';

// Mock Repository
const mockRepository = {
  getUserSettings: vi.fn(),
  createRequest: vi.fn(),
  createCreative: vi.fn(),
  createQueueJob: vi.fn(),
  updateRequestStatus: vi.fn(),
  rollbackRequest: vi.fn(),
} as unknown as CreativeRepository;

describe('CreateCreativeRequestUseCase', () => {
  let useCase: CreateCreativeRequestUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateCreativeRequestUseCase(mockRepository);
  });

  it('should create a single creative request successfully', async () => {
    // Arrange
    const userId = 'user-123';
    const input: CreateCreativeRequestData = {
      title: 'Test Campaign',
      prompt: 'A beautiful landscape',
      requested_formats: ['1:1'],
      quantity: 1,
      product_images: []
    };

    // Mock responses
    vi.spyOn(mockRepository, 'getUserSettings').mockResolvedValue({
      default_quality: 'auto',
      default_output_format: 'png',
      default_output_compression: 100,
      default_background: 'auto'
    });

    vi.spyOn(mockRepository, 'createRequest').mockResolvedValue({ id: 'request-1' });
    vi.spyOn(mockRepository, 'createCreative').mockResolvedValue({ id: 'creative-1' });
    vi.spyOn(mockRepository, 'createQueueJob').mockResolvedValue({ id: 'job-1' });

    // Act
    const result = await useCase.execute(userId, input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.request_id).toBe('request-1');
    expect(result.creatives_count).toBe(1);

    expect(mockRepository.createRequest).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Campaign',
      user_id: userId,
      status: 'pending'
    }));

    expect(mockRepository.createCreative).toHaveBeenCalledTimes(1);
    expect(mockRepository.createCreative).toHaveBeenCalledWith(expect.objectContaining({
      format: '1:1',
      request_id: 'request-1',
      title: 'Test Campaign - 1:1'
    }));

    expect(mockRepository.updateRequestStatus).toHaveBeenCalledWith('request-1', 'processing');
  });

  it('should handle multiple formats and quantity correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const input: CreateCreativeRequestData = {
      title: 'Multi Format',
      prompt: 'Test',
      requested_formats: ['1:1', '16:9'],
      quantity: 2, // 2 of each format = 4 total
      product_images: []
    };

    vi.spyOn(mockRepository, 'getUserSettings').mockResolvedValue({});
    vi.spyOn(mockRepository, 'createRequest').mockResolvedValue({ id: 'req-multi' });
    vi.spyOn(mockRepository, 'createCreative').mockResolvedValue({ id: 'cre-multi' });
    vi.spyOn(mockRepository, 'createQueueJob').mockResolvedValue({ id: 'job-multi' });

    // Act
    const result = await useCase.execute(userId, input);

    // Assert
    expect(result.creatives_count).toBe(4); // 2 formats * 2 quantity
    expect(mockRepository.createCreative).toHaveBeenCalledTimes(4);
  });

  it('should rollback on error', async () => {
    // Arrange
    const userId = 'user-123';
    const input: CreateCreativeRequestData = {
      title: 'Fail Case',
      prompt: 'Test',
      requested_formats: ['1:1'],
      product_images: []
    };

    vi.spyOn(mockRepository, 'getUserSettings').mockResolvedValue({});
    vi.spyOn(mockRepository, 'createRequest').mockResolvedValue({ id: 'req-fail' });
    // Simulate error on creative creation
    vi.spyOn(mockRepository, 'createCreative').mockRejectedValue(new Error('DB Error'));

    // Act & Assert
    await expect(useCase.execute(userId, input)).rejects.toThrow('DB Error');

    expect(mockRepository.rollbackRequest).toHaveBeenCalledWith('req-fail', expect.any(Array));
  });
});
