export class DB {
  private static localStorageKey = 'profile';

  public static unlockLevel(key: string) {
    const profile = this.getProfile();
    profile.unlocked.push(key);
    this.updateProfile(profile);
  }

  public static getUnlockedLevels(): string[] {
    const profile = this.getProfile();
    return profile.unlocked;
  }

  // public static completeLevel() {
  // }

  private static getProfile(): Profile {
    const serialized = localStorage.getItem(this.localStorageKey);

    if (serialized !== null) {
      const deserialied: Profile = JSON.parse(serialized);
      return deserialied;
    }
    else {
      return {
        completed: [],
        unlocked: ['map1.json']
      };
    }
  }

  private static updateProfile(newProfile: Profile) {
    const serialized = JSON.stringify(newProfile);
    localStorage.setItem(this.localStorageKey, serialized);
  }
}

interface Profile {
  completed: LevelCompletion[]
  unlocked: string[]
}

interface LevelCompletion {
  key: string
  completed: boolean
  date: Date
  timeMs: number
}
