import { Test, TestingModule } from '@nestjs/testing';
import { HelpController } from './help.controller';

describe('HelpController', () => {
  let controller: HelpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpController],
    }).compile();

    controller = module.get<HelpController>(HelpController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMacAddressHelp', () => {
    it('should return MAC address help object', () => {
      const result = controller.getMacAddressHelp();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('format');
      expect(result).toHaveProperty('windows');
      expect(result).toHaveProperty('linux');
      expect(result).toHaveProperty('mac');
      expect(result).toHaveProperty('notes');
    });

    it('should return correct title', () => {
      const result = controller.getMacAddressHelp();
      expect(result.title).toBe('Como obter o endereço MAC');
    });

    it('should have Windows instructions', () => {
      const result = controller.getMacAddressHelp();

      expect(result.windows).toBeDefined();
      expect(result.windows.title).toBe('Windows');
      expect(result.windows.steps).toBeInstanceOf(Array);
      expect(result.windows.steps.length).toBeGreaterThan(0);
    });

    it('should have Linux instructions', () => {
      const result = controller.getMacAddressHelp();

      expect(result.linux).toBeDefined();
      expect(result.linux.title).toBe('Linux');
      expect(result.linux.steps).toBeInstanceOf(Array);
      expect(result.linux.steps.length).toBeGreaterThan(0);
    });

    it('should have macOS instructions', () => {
      const result = controller.getMacAddressHelp();

      expect(result.mac).toBeDefined();
      expect(result.mac.title).toBe('macOS');
      expect(result.mac.steps).toBeInstanceOf(Array);
      expect(result.mac.steps.length).toBeGreaterThan(0);
    });

    it('should have notes array', () => {
      const result = controller.getMacAddressHelp();

      expect(result.notes).toBeInstanceOf(Array);
      expect(result.notes.length).toBeGreaterThan(0);
    });

    it('should include MAC address format example', () => {
      const result = controller.getMacAddressHelp();

      expect(result.format).toContain('AA:BB:CC:DD:EE:FF');
      expect(result.format).toContain('AA-BB-CC-DD-EE-FF');
    });

    it('should have comprehensive Windows steps', () => {
      const result = controller.getMacAddressHelp();

      // Should have at least 5 steps
      expect(result.windows.steps.length).toBeGreaterThanOrEqual(5);

      // Should mention ipconfig command
      const stepsText = result.windows.steps.join(' ');
      expect(stepsText).toContain('ipconfig');
    });

    it('should have comprehensive Linux steps', () => {
      const result = controller.getMacAddressHelp();

      // Should have at least 4 steps
      expect(result.linux.steps.length).toBeGreaterThanOrEqual(4);

      // Should mention common Linux commands
      const stepsText = result.linux.steps.join(' ');
      expect(stepsText.toLowerCase()).toMatch(/ip link|ifconfig|ip addr/);
    });

    it('should include important warnings in notes', () => {
      const result = controller.getMacAddressHelp();

      const notesText = result.notes.join(' ');

      // Should warn about unique MAC per interface
      expect(notesText).toContain('único');

      // Should mention CEI network
      expect(notesText).toContain('CEI');
    });
  });
});