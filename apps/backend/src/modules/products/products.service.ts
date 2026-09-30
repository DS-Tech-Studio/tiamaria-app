import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { is_available, ...productData } = createProductDto;
    const product = this.productRepository.create({
      ...productData,
      is_active: createProductDto.is_active ?? is_available ?? true,
    });
    const savedProduct = await this.productRepository.save(product);
    savedProduct.updateAvailability();
    return savedProduct;
  }

  async findAll(availableOnly?: boolean): Promise<Product[]> {
    if (availableOnly) {
      return await this.productRepository.find({
        where: { is_active: true, stock_quantity: MoreThan(0) },
        order: { name: 'ASC' },
      });
    }

    return await this.productRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { is_available, ...productData } = updateProductDto;
    this.productRepository.merge(product, {
      ...productData,
      ...(updateProductDto.is_active === undefined && is_available !== undefined
        ? { is_active: is_available }
        : {}),
    });
    const savedProduct = await this.productRepository.save(product);
    savedProduct.updateAvailability();
    return savedProduct;
  }

  async toggleAvailability(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.is_active = !product.is_active;
    const savedProduct = await this.productRepository.save(product);
    savedProduct.updateAvailability();
    return savedProduct;
  }
}