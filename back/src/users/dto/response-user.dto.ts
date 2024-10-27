import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export default class UserResponseDto {
    @ApiProperty({
        type: String,
        description: "El identificador único del usuario, asignado por la base de datos",
        required: true,
    })
    id: string;
    
    @ApiProperty({
        type: String,
        description: "El nombre del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    @MinLength(3)
    name: string;

    @ApiProperty({
        type: String,
        description: "El correo electrónico del usuario",
        required: true,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        type: String,
        description: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)",
        required: true,
    })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[=!@#$%^&*])[A-Za-z\d=!@#$%^&*]{8,15}$/,
        {
            message: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)"
        }
    )
    @IsString()
    password: string;

    @ApiProperty({
        type: Number,
        description: "La edad del usuario",
        required: true,
    })
    @IsNumber()
    age: number;

    @ApiProperty({
        type: Number,
        description: "El número de teléfono del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    phone: number;

    @ApiProperty({
        type: String,
        description: "La ciudad donde vive el usuario",
        required: false,
    })
    @IsString()
    @MaxLength(30)
    @MinLength(5)
    @IsOptional()
    city?: string;

    @ApiProperty({
        type: String,
        description: "La dirección donde vive el usuario",
        required: false,
    })
    @MaxLength(80)
    @MinLength(3)
    @IsString()
    @IsOptional()
    address?: string;

    constructor(partial: Partial<UserResponseDto>) { // Esto permite que el constructor acepte menos propiedades de las declaradas, por ejemplo, password
        const { name, age, email, address, phone, city } = partial;
        this.name = name;
        this.age = age;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.city = city;
    }
}
