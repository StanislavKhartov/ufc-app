import { Component, OnInit, signal } from '@angular/core'; // Добавили signal
import { DataService } from './services/data.service';
import { Fighter } from './models/fighter';
import { Match } from './models/match';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // Создаем сигналы вместо обычных массивов
  fighters = signal<Fighter[]>([]);
  matches = signal<Match[]>([]);

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    try {
      const fightersData = await this.dataService.getFighters();
      const matchesData = await this.dataService.getMatches();

      // Записываем данные в сигналы
      this.fighters.set(fightersData || []);
      this.matches.set(matchesData || []);

      console.log('Сигналы обновлены:', this.fighters(), this.matches());
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
}