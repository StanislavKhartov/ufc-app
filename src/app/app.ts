import { Component, computed, OnInit, signal } from '@angular/core'; // Добавили signal
import { DataService } from './services/data.service';
import { Fighter } from './models/fighter';
import { Match } from './models/match';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // Состояние
  activeTab = signal<'fighters' | 'matches'>('fighters');
  fighters = signal<Fighter[]>([]);
  matches = signal<Match[]>([]);
  
  // Для сортировки
  sortKey = signal<string>('');
  sortDir = signal<number>(1); // 1 - asc, -1 - desc

  // Для редактирования (Модалка)
  isModalOpen = false;
  editingItem: any = {};

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    this.refresh();
  }

  async refresh() {
    this.fighters.set(await this.dataService.getFighters());
    this.matches.set(await this.dataService.getMatches());
  }

  // --- ЛОГИКА СОРТИРОВКИ ---
  sortedData = computed(() => {
    const tab = this.activeTab();
    const data = tab === 'fighters' ? [...this.fighters()] : [...this.matches()];
    const key = this.sortKey();
    const dir = this.sortDir();

    if (!key) return data;

    return data.sort((a: any, b: any) => {
      let valA = a[key];
      let valB = b[key];

      // Если это вложенный объект (имя бойца в матче)
      if (key.includes('.')) {
        const parts = key.split('.');
        valA = a[parts[0]]?.[parts[1]];
        valB = b[parts[0]]?.[parts[1]];
      }

      // Честное сравнение чисел
      if (typeof valA === 'number') return (valA - valB) * dir;
      
      // Честное сравнение дат
      if (key.includes('date')) {
        return (new Date(valA).getTime() - new Date(valB).getTime()) * dir;
      }

      // Сравнение строк
      return (valA || '').toString().localeCompare((valB || '').toString()) * dir;
    });
  });

  setSort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.update(d => -d);
    } else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
  }

  // --- CRUD ---
  openModal(item: any = {}) {
    this.editingItem = { ...item };
    this.isModalOpen = true;
  }

  async save() {
    const table = this.activeTab();
    // Чистим объект от UI-полей перед сохранением
    const { fighter1, fighter2, ...payload } = this.editingItem;
    await this.dataService.save(table, payload);
    this.isModalOpen = false;
    this.refresh();
  }

  async deleteItem(id: string) {
    if (confirm('Are you sure?')) {
      await this.dataService.delete(this.activeTab(), id);
      this.refresh();
    }
  }

  asFighter(item: any): Fighter {
    return item as Fighter;
  }


  asMatch(item: any): Match {
    return item as Match;
  }
}