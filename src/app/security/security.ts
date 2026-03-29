export class SecurityUtils {


    static sanitize(input: any): any {
        if (input === null || input === undefined) return input;

        if (Array.isArray(input)) {
            return input.map(item => this.sanitize(item));
        }

        if (typeof input === 'object') {
            const sanitizedObj: any = {};
            for (const key in input) {
                if (Object.prototype.hasOwnProperty.call(input, key)) {
                    sanitizedObj[key] = this.sanitize(input[key]);
                }
            }
            return sanitizedObj;
        }

        if (typeof input !== 'string') return input;

        return input
            .replace(/\0/g, '')
            .replace(/<[^>]*>?/gm, '')
            .replace(/--+/g, '')
            .replace(/\/\*.*?\*\//g, '')
            .replace(/;/g, '')
            .replace(/['"\\`]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static validateFighter(data: any): string | null {
  // 1. Базовая проверка на существование данных
  if (!data || !data.full_name || data.full_name.length < 2) {
    return "Invalid name: minimum 2 characters required.";
  }

  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;

  if (!nameRegex.test(data.full_name)) {
    return "Invalid name format: only letters, spaces and hyphens are allowed.";
  }

  if (data.height_cm < 50 || data.height_cm > 280) {
    return "Invalid height: must be between 50 and 280 cm.";
  }
  
  if (data.weight_kg < 20 || data.weight_kg > 600) {
    return "Invalid weight: must be between 20 and 600 kg.";
  }

  return null;
}

    static validateMatch(data: any): string | null {
        if (!data.tournament_name) return "Tournament name is required.";
        if (!data.event_date) return "Date is required.";
        if (data.fighter_1_id === data.fighter_2_id) {
            return "Conflict: A fighter cannot be matched against themselves.";
        }

        return null;
    }
}