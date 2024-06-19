import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http:AxiosAdapter,
  ){}

  async executeSeed() {

    await this.pokemonModel.deleteMany({}); //!equivale al delete *

    const data  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: {name: string, no: number}[] = [];

    // const insertPromisesArray = [];

    data.results.forEach( ( {name, url} ) => {

      const segments = url.split('/');
      const no = +segments.at(-2);

      // const pokemon = await this.pokemonModel.create({ name, no })
      // insertPromisesArray.push(
      //   this.pokemonModel.create({ name, no })
      // );

      pokemonToInsert.push({ name, no });
    });
    
    // //!esto espera a que todas las promesas se resuelvan y hace todas las inserciones de manera simultanea
    // await Promise.all( insertPromisesArray ); 
    
    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed';
  }
}
