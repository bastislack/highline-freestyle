export class Trick {
  id: number
  alias?: string 
  technicalName: string
  difficultyLevel: number

  constructor(id: number, technicalName: string, difficultyLevel: number, alias?: string) {
    this.id = id;
    this.technicalName = technicalName;
    this.difficultyLevel = difficultyLevel;
    this.alias = alias;
  }
}